import { getSession, setSession, syncCookies } from './agent'
import { login, logout, getCurrentUser, getFairteiler, getConversation, getConversations, markAsRead, getWall, getCurrentProfile } from './adapters/rest'
import { getFairteilerMarker } from './adapters/xhr'
import { userToConversationId, sendMessage } from './adapters/xhrapp'

import getProfile from './adapters/scraping/profile'
import getRegion from './adapters/scraping/region'

export {
  getSession,
  setSession,
  syncCookies,

  login,
  logout,
  getCurrentUser,
  getFairteiler,
  getConversation,
  getConversations,
  markAsRead,
  getWall,
  getCurrentProfile,

  getFairteilerMarker,

  userToConversationId,
  sendMessage,

  getProfile,
  getRegion
}