import { User, Results, Fairteiler, Marker, ConversationDetail, ConversationListEntry, WallPosts, Message, Profile } from './typings'
import CookieManager from 'react-native-cookies'

const host = 'https://beta.foodsharing.de'
    , endpoints = {
        login: {uri: '/api/user/login', method: 'POST'},
        logout: {uri: '/api/user/logout', method: 'POST'},
        current: {uri: '/api/user/current', method: 'GET'},
        profile: {uri: '/api/profile/current', method: 'GET'},
        wall: {uri: '/api/wall/{target}/{targetId}', method: 'GET'},
        store: {uri: '/api/stores/{storeId}', method: 'GET'},
        conversations: {uri: '/api/conversations', method: 'GET'},
        conversation: {uri: '/api/conversations/{conversationId}', method: 'GET'},
        message: {uri: '/xhrapp.php?app=msg&m=sendmsg', method: 'POST'},
        user2conv: {uri: '/xhrapp.php?app=msg&m=user2conv&fsid={userId}', method: 'GET'},

        fairteiler: {uri: '/api/fairSharePoints/{id}', method: 'GET'},
        fairteilerMarker: {uri: '/xhr.php?f=loadMarker&types[]=fairteiler', method: 'GET'},

        // TODO:
        baskets: {uri: '/xhr.php?f=loadMarker&types[]=baskets', method: 'GET'},
        shops: {uri: '/xhr.php?f=loadMarker&types[]=betriebe&options[]=needhelp&options[]=needhelpinstant', method: 'GET'}
      }

let cookies = {} as any

export const syncCookies = async () => {
  // Pull our cookies from the native side of things
  cookies = await CookieManager.get(host)

  // Sync session cookie between beta and production endpoints
  await CookieManager.setFromResponse(
    'https://foodsharing.de/',
    `PHPSESSID=${cookies.PHPSESSID}; path=/; Thu, 1 Jan 2030 00:00:00 -0000; secure`
  )
}

function request(
  endpoint:
    'login' |
    'current' |
    'logout' |
    'profile' |
    'wall' |
    'store' |
    'conversations' |
    'conversation' |
    'message' |
    'user2conv' |
    'fairteiler' |
    'fairteilerMarker',
  data?: any,
  options?: any
): Promise<any> {
  const { method, uri } = endpoints[endpoint]
      , opts = options || {}
      , url = host + Object.keys(opts)
                      .reduce((u, key) => u.replace('{' + key +'}', opts[key]), uri)
      , sendAsJSON = !url.match(/xhrapp/)

  return fetch(url, {
    headers: {
      Accept: 'application/json',
      ...(cookies['CSRF_TOKEN'] ? {'X-CSRF-Token': cookies['CSRF_TOKEN']} : {}),
      ...(data ? {'Content-Type': sendAsJSON ? 'application/json' : 'application/x-www-form-urlencoded'} : {})
    },
    method,
    credentials: 'same-origin',
    ...(data ? {
      body: sendAsJSON ?
        JSON.stringify(data) :
        Object.keys(data).map(k => k + '=' + encodeURIComponent(data[k])).join('&')
    } : {})
  }).then(response => {
    if (response.headers.has('set-cookie'))
      syncCookies()

    if (response.status === 200)
      return response.json()

    // console.warn('request error', endpoint, data, options, response)
    switch (response.status) {
      case 400: throw Results.MALFORMED
      case 401: throw Results.FORBIDDEN
      case 403: throw Results.UNAUTHORIZED
      case 404: throw Results.NOT_FOUND
      case 500: throw Results.SERVER_ERROR

      default: throw Results.SERVER_ERROR
    }
  })
}

export const getSession = (): {session: string, token: string} => ({
  session: cookies['PHPSESSID'],
  token: cookies['CSRF_TOKEN']
})

export const setSession = ({session, token}) => {
  cookies['PHPSESSID'] = session
  cookies['CSRF_TOKEN'] = token
}

export const login = (email: string, password: string): Promise<User> =>
  request('login', {email, password, remember_me: true})

export const logout = (): Promise<void> =>
  request('logout')

export const getCurrentUser = (): Promise<User> =>
  request('current')

export const getFairteiler = (id: number): Promise<Fairteiler> =>
  request('fairteiler', null, {id})

export const getFairteilerMarker = async (): Promise<Marker[]> =>
  (await request('fairteilerMarker')).fairteiler

export const getConversations = (): Promise<ConversationListEntry[]> =>
  request('conversations')

export const getConversation = (conversationId: number): Promise<ConversationDetail> =>
  request('conversation', null, {conversationId})

export const getWall = (target: 'foodsaver' | 'fairteiler', targetId: number): Promise<WallPosts> =>
  request('wall', null, {target, targetId})

export const sendMessage = async (conversationId: number, text: string): Promise<Message> =>
  (await request('message', {c: conversationId, b: text})).data.msg

export const userToConversationId = async (userId: number): Promise<number> =>
  parseInt((await request('user2conv', null, {userId})).data.cid)

export const getProfile = (): Promise<Profile> =>
  request('profile')


// TODO: backend returns 500
// export const getStore = (storeId: number): Promise<any> =>
// //   request('store', {storeId})
