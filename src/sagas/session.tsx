import { take, fork, call, put, select } from 'redux-saga/effects'
import { Actions } from 'react-native-router-flux'
import * as Keychain from 'react-native-keychain'
import { actions as formActions } from 'react-redux-form'

import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  LOGOUT,
  KEYCHAIN,
  PROFILE
} from '../common/constants'

import { login, logout, getSession, getProfile } from '../common/api'

function* loginFlow(email: string, password: string) {
  let user

  try {
    // Here we go, login the user
    user = yield call(login, email, password)

    // Signal our succesful login and broadcast our fresh token and session
    yield put({type: LOGIN_SUCCESS, payload: getSession()})

    // Save the validated email and password in the device's safe store
    Keychain.setGenericPassword(email, password).then(() => true)

    // All good, let's proceed to main
    Actions.reset('drawer')

    // Request and broadcast the profile information of our fresh user
    yield put({type: PROFILE, payload: yield call(getProfile)})

  } catch (error) {
    // Signal that something went wrong..
    yield put({ type: LOGIN_ERROR, error })
  }

  return user
}

function* logoutFlow() {
  // Reset all forms
  yield put(formActions.reset('drafts'))
  yield put(formActions.change('login.password', ''))

  // Throw the user back to the login screen
  Actions.reset('login')

  // Delete the previously stored password from the secure location

  Keychain.resetGenericPassword().then(() => true)

  // Log the user out from foodsharing.network
  yield call(logout)
}

function* reauthenticate() {
  // Notificate all listeners that we got a valid session running
  const { session, token } = yield select(state => state.app)

  // Instantly drop the user to the main area for now until we figure out the authentication
  if (session)
    yield Actions.reset('drawer')

  try {
    if (!session)
      throw false

    // Check if we still have a valid session at hand
    const profile = yield getProfile()

    // Yep, update it
    yield put({type: PROFILE, payload: profile})

    // Notificate all listeners that we got a valid session running
    yield put({type: LOGIN_SUCCESS, payload: {session, token}})

  } catch(e) {
    // Try to pull previously stored credentials from secure store
    const result = yield Keychain.getGenericPassword()

    // If we don't find what we need, directly proceed to login
    if (!result || !result.username || !result.password)
      return Actions.reset('login')

    // Blast them through the pipe to get 'em into the store
    const { username: email, password } = result
    yield put({type: KEYCHAIN, payload: {email, password}})

    // Populate our login state/form
    yield put(formActions.change('login.email', email))
    yield put(formActions.change('login.password', password))

    // ... to finally trigger the login procedure
    yield put({type: LOGIN_REQUEST})
  }
}

export default function* loginWatcher() {
  // Water our store with previously stored credentials
  yield fork(reauthenticate)

  while (true) {
    // Wait until we get a login request
    yield take(LOGIN_REQUEST)

    // Pull credentials from store
    const { email, password } = yield select(state => state.login)

    // Start the login flow
    yield fork(loginFlow, email, password)

    // Wait until we either logout or get logged out
    yield take([LOGOUT, LOGIN_ERROR])

    // Start the logout flow
    yield call(logoutFlow)
  }
}