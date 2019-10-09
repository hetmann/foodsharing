import React, { Component, Fragment } from 'react'
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, Platform } from 'react-native'
import { Actions } from 'react-native-router-flux'
import { User, ConversationListEntry, Profile } from '../common/typings'

import moment from 'moment'

import RoundedImage from './RoundedImage'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as reduxActions from '../common/actions'

import colors from '../common/colors'
import { translate } from '../common/translation'
import { foodsaver } from '../common/placeholder'

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    width,
    height: width * 0.19 + 10,
    flexDirection: 'row'
  },
  lastMessage: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  images: {
    width: width * 0.22,
    flexWrap: 'wrap',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 3
  },
  name: {
    fontSize: 14,
    fontWeight: '400'
  },
  date: {
    color: colors.conversationDate,
    fontSize: 11
  },
  lastMessageImage: {
    width: 18,
    marginRight: 8
  },
  lastMessageText: {
    fontSize: 11,
    flex: 1,
    color: colors.messagePreview
  },
  seperator: {
    height: 1,
    width: width * 0.78 - 10,
    backgroundColor: colors.lightgray,
    position: 'absolute',
    right: 0,
    bottom: 1
  }
})

type Props = {
  conversation: {member: string[]} & ConversationListEntry,
  testID: string,
  isLast: boolean,
  foodsavers: {string: User},
  profile: Profile
}

class ConversationsItem extends Component<Props> {
  shouldComponentUpdate(next: Props) {
    const { testID, isLast, profile, conversation } = this.props

    return next.testID !== testID
        || next.isLast !== isLast
        || next.profile.id !== profile.id
        || next.conversation !== conversation
  }

  render() {
    const { conversation, testID, isLast, foodsavers, profile } = this.props
        , { id, member, name, last_ts, last_message, last_foodsaver_id } = conversation

        , isSelfMessage = member.length === 1 && profile.id && member[0] == profile.id.toString()
        , party = member.length === 1 ? member : member.filter(member => member !== (profile.id || '').toString())
        , date = moment(parseInt(last_ts) * 1000)
        , isToday = date.isSame(new Date(), 'day')
        , isYesterday = date.isSame(new Date(Date.now() - 24*60*60*1000), 'day')
        , lastMessenger = member.find(member => member === last_foodsaver_id)
        , isUnread = conversation.unread !== "0"

    return (
      <Fragment>
        <TouchableOpacity
          style={[styles.container, isUnread && {backgroundColor: colors.messageUnreadBackground}]}
          onPress={() => Actions.jump('conversation', {conversationId: id})}
          testID={testID}
        >
          <View style={styles.images}>
            {party.slice(0, Platform.OS === 'ios' ? 4 : 2).map(person =>
              <RoundedImage
                key={`${id}.${person}`}
                style={party.length > 1 ? {width: '48%', margin: '1%'} : {width: '100%'}}
                photo={foodsaver(foodsavers[person]).photo}
              />
            )}
          </View>

          <View style={{flex: 1, padding: 10}}>
            <View style={styles.header}>
              <View style={{flex: 1}}>
                <Text
                  numberOfLines={1}
                  style={[styles.name, isUnread && {color: colors.messageUnread}]}
                >
                  {name ? name :
                    isSelfMessage ? translate('conversations.note_to_self') :
                    party.map(person => foodsaver(foodsavers[person]).name).join('|')
                  }
                </Text>
              </View>
              <View>
                <Text style={[styles.date, isUnread && {color: colors.messageUnread}]}>
                  {isYesterday ?
                    translate('conversations.yesterday') :
                    isToday ? date.format('HH:mm') :
                    date.format('LL').split(/,* \d{4}$/)[0]
                  }
                </Text>
              </View>
            </View>

            <View style={[styles.lastMessage]}>
              {!!foodsaver(foodsavers[lastMessenger]).photo &&
                <View style={styles.lastMessageImage}>
                  <RoundedImage photo={foodsavers[lastMessenger].photo} />
                </View>
              }
              <Text
                style={[styles.lastMessageText, isUnread && {fontWeight: 'bold'}]}
                numberOfLines={1}
                ellipsizeMode="tail"
                testID={testID + '.last'}
              >
                {last_message}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        {!isLast &&
          <View style={styles.seperator} />
        }
      </Fragment>
    )
  }
}

const mapStateToProps = state => ({
  foodsavers: state.foodsavers,
  profile: state.profile
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(reduxActions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConversationsItem)
