import agent from '../../agent'

export default async (id: number): Promise<{
  id: number,
  isOnline: boolean,
  isFriend: boolean,
  stats: any,
  bananas: {body: string, time: string, fs_photo: string, fs_id: string, fs_name: string}[],
  infos: {title: string, body: string}[],
  sleepStatus: boolean
}> => {
  const $ = await agent('profile', null, {id})
      , stats = [
        'basketcount',
        'bananacount',
        'postcount',
        'fetchcount',
        'fetchweight'
      ]

      , infoTitles = $('.pure-g .infos').find('p strong').map(({}, e) => $(e).text().trim()).get()
      , infoData = $('.pure-g .infos').find('p').map(({}, e) => $(e).text().trim()).get()
      , infos = infoTitles.reduce((infos, title, index) => infos.concat({
        title,
        body:
          infoData[index]
          .substr(title.length, infoData[index].length - title.length)
      }), [])

  return {
    id,

    isOnline: $('.msg-inside.info').length === 1,

    isFriend: $('.buddyRequest').length === 0,

    stats:
      stats.reduce((stats, id) => {
        stats[id] = parseInt($(`.stat_${id} .val`).text().replace(/\D/g, '') || 0)
        return stats
      }, {}),

    bananas:
      $('#bananas tr')
      .map(
        ({}, e) => ({
          fs_photo: $(e).find('img').attr('src').replace(/\/im(ages\/[^_]+_[^_]+_|g\/.+|age\/.+)/, ''),
          fs_id: $(e).find('a').attr('href').match(/\d+/g)[0],
          body: $(e).find('.msg').text().trim(),
          time: $(e).find('.time').text().split(/ (von|by) /)[0].split(/, /)[1],
          fs_name: $(e).find('.time').text().split(/ (von|by) /)[2]
        })
      ).get(),

    sleepStatus:
      parseInt(
        $('[class*="sleepmode-"]')
        .attr('class')
        .match(/(\d+)/g)
        .pop()
      ) > 0,

    infos
  }
}
