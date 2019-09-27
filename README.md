# 🍴foodsharing app

This is a Proof of Concept to show how [React Native](https://github.com/facebook/react-native) could rock the [foodsharing](https://foodsharing.de) world :smile:

This thingy runs on iOS and Android - one code, one love!


## 🎉 What's implemented?

* Login
  * Auth via email and password
  * Links to web based register & password restore
  * Using device's keychain to store credentials in a secure location
  * Display of current build version

* Drawer
  * Button for Logout
  * Display of logo and name of user
  * Display of current build version

* Conversations
  * Send and receive messages
  * WebSocket for direct push
  * Persiting message drafts per conversation
  * Group chats (incl. multiple avatars displayed)
  * Named chats
  * Today -> Yesterday -> $Date labeling in list

* Custom fonts
* Full i18n support (so far: English included)

* Deployment and CI
  * Fastlane (icon & badge generation, certificates, deploy, ...)

* Tech stack
  * React Native
  * redux / redux-saga for js generator magic
  * see [package.json](https://github.com/rastapasta/foodsharing/blob/master/package.json) for complete package list

## ToDo

* Today -> Yesterday -> $Date seperators in conversation
* Login / Logout
* Data store and persitence
* Background pull as Push Notification replacement
* Notifications after background pull
* Storing session cookie
* Today / Yesterday / Date seperators in conversations list
