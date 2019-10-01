import React, { useState } from 'react'
import { StyleSheet, View, Dimensions, Text } from 'react-native'
import { AllHtmlEntities } from 'html-entities'
import { Message } from '../common/typings'

import Linkify from './Linkify'

import colors from '../common/colors'

import { translate } from '../common/translation'

import moment from 'moment'
import RoundedImage from './RoundedImage'

const entities = new AllHtmlEntities()

const { width } = Dimensions.get('window')
    , bubbleRadius = 12

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  bubble: {
    maxWidth: width * 0.7,
    borderTopLeftRadius: bubbleRadius,
    borderTopRightRadius: bubbleRadius,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 10,
    marginRight: 10,
    marginBottom: 10
  },
  sentBubble: {
    borderBottomLeftRadius: bubbleRadius,
    backgroundColor: colors.messageSentBubble
  },
  receivedBubble: {
    borderBottomRightRadius: bubbleRadius,
    backgroundColor: colors.messageReceivedBubble
  },
  message: {
  },
  receivedMessage: {
    color: colors.messageReceivedText
  },
  sentMessage: {
    color: colors.messageSentText
  },
  time: {
    right: 0,
    fontSize: 11,
    marginTop: 3,
    marginBottom: 7,
    textAlign: 'right',
  },
  receivedTime: {
    color: colors.messageRecievedTime
  },
  sentTime: {
    color: colors.messageSentTime
  },
  image: {
    width: 40,
    height: 40,
    marginLeft: 6,
    marginRight: 6,
    marginBottom: 8
  }
})

type Props = {
  type: string
  message: Message
}

const MAX_LENGTH = 600

export default ({type, message}: Props) => {
  const [expanded, setExpanded] = useState(false)
      , decoded = entities.decode(message.body)
      , shortened = !expanded && decoded.length > 1000
      , text = expanded ? decoded : decoded.substr(0, MAX_LENGTH)

  return (
    <View style={[styles.container, {justifyContent: type === 'sent' ? 'flex-end' : 'flex-start'}]}>
      {type === 'received' &&
        <View style={styles.image}>
          <RoundedImage photo={message.fs_photo} />
        </View>
      }
      <View style={[styles.bubble, styles[type+'Bubble']]}>
        <Text>
          <Linkify
            style={[styles.message, styles[type+'Message']]}
            text={text}
          />
          {shortened && <Text>...{' '}
            <Text onPress={() => setExpanded(true)} style={{fontWeight: 'bold'}}>
              {translate('conversations.read_more')}
            </Text>
          </Text>}
        </Text>
        <Text style={[styles.time, styles[type+'Time']]}>
          {moment(message.time).format('HH:mm')}
        </Text>
      </View>
    </View>
  )
}