export interface NoiseSound {
  id: string; // unique, e.g. "animals-beehive"
  filename: string; // "beehive.mp3"
  name: string; // Chinese name
  url: string; // "/music/white_noise/animals/beehive.mp3"
}

export interface NoiseCategory {
  id: string; // e.g. "animals"
  name: string; // Chinese category name
  sounds: NoiseSound[];
}

export const NOISE_CATALOG: NoiseCategory[] = [
  {
    id: 'animals',
    name: '动物生机',
    sounds: [
      { id: 'animals-beehive', filename: 'beehive.mp3', name: '蜂群嗡嗡', url: '/music/white_noise/animals/beehive.mp3' },
      { id: 'animals-birds', filename: 'birds.mp3', name: '林间鸟鸣', url: '/music/white_noise/animals/birds.mp3' },
      { id: 'animals-cat-purring', filename: 'cat-purring.mp3', name: '猫咪呼噜', url: '/music/white_noise/animals/cat-purring.mp3' },
      { id: 'animals-chickens', filename: 'chickens.mp3', name: '农家鸡鸣', url: '/music/white_noise/animals/chickens.mp3' },
      { id: 'animals-cows', filename: 'cows.mp3', name: '牧场牛哞', url: '/music/white_noise/animals/cows.mp3' },
      { id: 'animals-crickets', filename: 'crickets.mp3', name: '静夜蟋蟀', url: '/music/white_noise/animals/crickets.mp3' },
      { id: 'animals-crows', filename: 'crows.mp3', name: '黑鸦啼叫', url: '/music/white_noise/animals/crows.mp3' },
      { id: 'animals-dog-barking', filename: 'dog-barking.mp3', name: '遥闻犬吠', url: '/music/white_noise/animals/dog-barking.mp3' },
      { id: 'animals-frog', filename: 'frog.mp3', name: '夏池蛙鸣', url: '/music/white_noise/animals/frog.mp3' },
      { id: 'animals-horse-gallop', filename: 'horse-gallop.mp3', name: '马蹄急驰', url: '/music/white_noise/animals/horse-gallop.mp3' },
      { id: 'animals-owl', filename: 'owl.mp3', name: '深夜古鸮', url: '/music/white_noise/animals/owl.mp3' },
      { id: 'animals-seagulls', filename: 'seagulls.mp3', name: '海鸥盘旋', url: '/music/white_noise/animals/seagulls.mp3' },
      { id: 'animals-sheep', filename: 'sheep.mp3', name: '绵羊咩咩', url: '/music/white_noise/animals/sheep.mp3' },
      { id: 'animals-whale', filename: 'whale.mp3', name: '深海鲸歌', url: '/music/white_noise/animals/whale.mp3' },
      { id: 'animals-wolf', filename: 'wolf.mp3', name: '荒野孤狼', url: '/music/white_noise/animals/wolf.mp3' },
      { id: 'animals-woodpecker', filename: 'woodpecker.mp3', name: '树梢啄木鸟', url: '/music/white_noise/animals/woodpecker.mp3' }
    ]
  },
  {
    id: 'binaural',
    name: '双脑共鸣',
    sounds: [
      { id: 'binaural-alpha', filename: 'binaural-alpha.wav', name: 'Alpha 专注入眠脑波', url: '/music/white_noise/binaural/binaural-alpha.wav' },
      { id: 'binaural-beta', filename: 'binaural-beta.wav', name: 'Beta 舒压清醒波', url: '/music/white_noise/binaural/binaural-beta.wav' },
      { id: 'binaural-delta', filename: 'binaural-delta.wav', name: 'Delta 深梦熟睡波', url: '/music/white_noise/binaural/binaural-delta.wav' },
      { id: 'binaural-gamma', filename: 'binaural-gamma.wav', name: 'Gamma 思想火花脑波', url: '/music/white_noise/binaural/binaural-gamma.wav' },
      { id: 'binaural-theta', filename: 'binaural-theta.wav', name: 'Theta 静意冥想波', url: '/music/white_noise/binaural/binaural-theta.wav' }
    ]
  },
  {
    id: 'nature',
    name: '自然风物',
    sounds: [
      { id: 'nature-campfire', filename: 'campfire.mp3', name: '噼啪柴火篝火', url: '/music/white_noise/nature/campfire.mp3' },
      { id: 'nature-droplets', filename: 'droplets.mp3', name: '幽潭泉水滴落', url: '/music/white_noise/nature/droplets.mp3' },
      { id: 'nature-howling-wind', filename: 'howling-wind.mp3', name: '朔风凛冽呼啸', url: '/music/white_noise/nature/howling-wind.mp3' },
      { id: 'nature-jungle', filename: 'jungle.mp3', name: '静穆原始雨林', url: '/music/white_noise/nature/jungle.mp3' },
      { id: 'nature-river', filename: 'river.mp3', name: '清浅小溪流淌', url: '/music/white_noise/nature/river.mp3' },
      { id: 'nature-walk-in-snow', filename: 'walk-in-snow.mp3', name: '雪地漫步沙沙', url: '/music/white_noise/nature/walk-in-snow.mp3' },
      { id: 'nature-walk-on-gravel', filename: 'walk-on-gravel.mp3', name: '漫步砂石浅道', url: '/music/white_noise/nature/walk-on-gravel.mp3' },
      { id: 'nature-walk-on-leaves', filename: 'walk-on-leaves.mp3', name: '踏踩落叶沙沙', url: '/music/white_noise/nature/walk-on-leaves.mp3' },
      { id: 'nature-waterfall', filename: 'waterfall.mp3', name: '空山幽涧飞瀑', url: '/music/white_noise/nature/waterfall.mp3' },
      { id: 'nature-waves', filename: 'waves.mp3', name: '温柔落潮拍岸', url: '/music/white_noise/nature/waves.mp3' },
      { id: 'nature-wind-in-trees', filename: 'wind-in-trees.mp3', name: '幽谷山风吹拂', url: '/music/white_noise/nature/wind-in-trees.mp3' },
      { id: 'nature-wind', filename: 'wind.mp3', name: '旷原轻柔清风', url: '/music/white_noise/nature/wind.mp3' }
    ]
  },
  {
    id: 'noise',
    name: '深度噪声',
    sounds: [
      { id: 'noise-brown-noise', filename: 'brown-noise.wav', name: '深沉褐色噪声', url: '/music/white_noise/noise/brown-noise.wav' },
      { id: 'noise-pink-noise', filename: 'pink-noise.wav', name: '舒缓粉红噪声', url: '/music/white_noise/noise/pink-noise.wav' },
      { id: 'noise-white-noise', filename: 'white-noise.wav', name: '安眠白噪声', url: '/music/white_noise/noise/white-noise.wav' }
    ]
  },
  {
    id: 'places',
    name: '特定空间',
    sounds: [
      { id: 'places-airport', filename: 'airport.mp3', name: '旅客机场大厅', url: '/music/white_noise/places/airport.mp3' },
      { id: 'places-cafe', filename: 'cafe.mp3', name: '街角暖意咖啡馆', url: '/music/white_noise/places/cafe.mp3' },
      { id: 'places-carousel', filename: 'carousel.mp3', name: '童趣旋转木马', url: '/music/white_noise/places/carousel.mp3' },
      { id: 'places-church', filename: 'church.mp3', name: '唱诗礼拜堂钟声', url: '/music/white_noise/places/church.mp3' },
      { id: 'places-construction-site', filename: 'construction-site.mp3', name: '远方施工机械声', url: '/music/white_noise/places/construction-site.mp3' },
      { id: 'places-crowded-bar', filename: 'crowded-bar.mp3', name: '爵士酒吧呢喃', url: '/music/white_noise/places/crowded-bar.mp3' },
      { id: 'places-laboratory', filename: 'laboratory.mp3', name: '化学实验室气泡', url: '/music/white_noise/places/laboratory.mp3' },
      { id: 'places-laundry-room', filename: 'laundry-room.mp3', name: '静中滚筒洗衣房', url: '/music/white_noise/places/laundry-room.mp3' },
      { id: 'places-library', filename: 'library.mp3', name: '静穆纸本图书馆', url: '/music/white_noise/places/library.mp3' },
      { id: 'places-night-village', filename: 'night-village.mp3', name: '幽村夏夜鸣幽', url: '/music/white_noise/places/night-village.mp3' },
      { id: 'places-office', filename: 'office.mp3', name: '清闲办公键盘底音', url: '/music/white_noise/places/office.mp3' },
      { id: 'places-restaurant', filename: 'restaurant.mp3', name: '西餐厅推杯换盏', url: '/music/white_noise/places/restaurant.mp3' },
      { id: 'places-subway-station', filename: 'subway-station.mp3', name: '地下铁列车风驰', url: '/music/white_noise/places/subway-station.mp3' },
      { id: 'places-supermarket', filename: 'supermarket.mp3', name: '繁华超市选购', url: '/music/white_noise/places/supermarket.mp3' },
      { id: 'places-temple', filename: 'temple.mp3', name: '古梵刹木鱼涤气', url: '/music/white_noise/places/temple.mp3' },
      { id: 'places-underwater', filename: 'underwater.mp3', name: '深海水底浮潜', url: '/music/white_noise/places/underwater.mp3' }
    ]
  },
  {
    id: 'rain',
    name: '密雨声声',
    sounds: [
      { id: 'rain-heavy-rain', filename: 'heavy-rain.mp3', name: '雷鸣瓢泼暴雨', url: '/music/white_noise/rain/heavy-rain.mp3' },
      { id: 'rain-light-rain', filename: 'light-rain.mp3', name: '林间淅淅微雨', url: '/music/white_noise/rain/light-rain.mp3' },
      { id: 'rain-rain-on-car-roof', filename: 'rain-on-car-roof.mp3', name: '阵雨轻拍车顶', url: '/music/white_noise/rain/rain-on-car-roof.mp3' },
      { id: 'rain-rain-on-leaves', filename: 'rain-on-leaves.mp3', name: '落雨击打树梢', url: '/music/white_noise/rain/rain-on-leaves.mp3' },
      { id: 'rain-rain-on-tent', filename: 'rain-on-tent.mp3', name: '雨过户外睡帐', url: '/music/white_noise/rain/rain-on-tent.mp3' },
      { id: 'rain-rain-on-umbrella', filename: 'rain-on-umbrella.mp3', name: '烟雨拍打雨伞', url: '/music/white_noise/rain/rain-on-umbrella.mp3' },
      { id: 'rain-rain-on-window', filename: 'rain-on-window.mp3', name: '雨水轻叩车窗', url: '/music/white_noise/rain/rain-on-window.mp3' },
      { id: 'rain-thunder', filename: 'thunder.mp3', name: '远天阵阵滚雷', url: '/music/white_noise/rain/thunder.mp3' }
    ]
  },
  {
    id: 'things',
    name: '器物暖音',
    sounds: [
      { id: 'things-boiling-water', filename: 'boiling-water.mp3', name: '围炉煮茶沸水声', url: '/music/white_noise/things/boiling-water.mp3' },
      { id: 'things-bubbles', filename: 'bubbles.mp3', name: '轻柔温水泡破裂', url: '/music/white_noise/things/bubbles.mp3' },
      { id: 'things-ceiling-fan', filename: 'ceiling-fan.mp3', name: '老旧吊扇悠转', url: '/music/white_noise/things/ceiling-fan.mp3' },
      { id: 'things-clock', filename: 'clock.mp3', name: '深夜挂钟滴答', url: '/music/white_noise/things/clock.mp3' },
      { id: 'things-dryer', filename: 'dryer.mp3', name: '热风干衣机运转', url: '/music/white_noise/things/dryer.mp3' },
      { id: 'things-keyboard', filename: 'keyboard.mp3', name: '机械键盘轻打', url: '/music/white_noise/things/keyboard.mp3' },
      { id: 'things-morse-code', filename: 'morse-code.mp3', name: '莫尔斯电码滴答', url: '/music/white_noise/things/morse-code.mp3' },
      { id: 'things-paper', filename: 'paper.mp3', name: '旧书翻面沙沙', url: '/music/white_noise/things/paper.mp3' },
      { id: 'things-singing-bowl', filename: 'singing-bowl.mp3', name: '精纯梵意颂钵', url: '/music/white_noise/things/singing-bowl.mp3' },
      { id: 'things-slide-projector', filename: 'slide-projector.mp3', name: '幻灯放映机跳片', url: '/music/white_noise/things/slide-projector.mp3' },
      { id: 'things-tuning-radio', filename: 'tuning-radio.mp3', name: '晶体管收音机寻台', url: '/music/white_noise/things/tuning-radio.mp3' },
      { id: 'things-typewriter', filename: 'typewriter.mp3', name: '旧打字机机括哒哒', url: '/music/white_noise/things/typewriter.mp3' },
      { id: 'things-vinyl-effect', filename: 'vinyl-effect.mp3', name: '黑胶唱片经典沙沙', url: '/music/white_noise/things/vinyl-effect.mp3' },
      { id: 'things-washing-machine', filename: 'washing-machine.mp3', name: '滚筒洗衣节奏', url: '/music/white_noise/things/washing-machine.mp3' },
      { id: 'things-wind-chimes', filename: 'wind-chimes.mp3', name: '竹风轻起风铃', url: '/music/white_noise/things/wind-chimes.mp3' },
      { id: 'things-windshield-wipers.mp3', filename: 'windshield-wipers.mp3', name: '汽车雨刷擦拭', url: '/music/white_noise/things/windshield-wipers.mp3' }
    ]
  },
  {
    id: 'transport',
    name: '人在旅途',
    sounds: [
      { id: 'transport-airplane', filename: 'airplane.mp3', name: '夜航飞机舱噪', url: '/music/white_noise/transport/airplane.mp3' },
      { id: 'transport-inside-a-train', filename: 'inside-a-train.mp3', name: '穿夜火车包厢声', url: '/music/white_noise/transport/inside-a-train.mp3' },
      { id: 'transport-rowing-boat', filename: 'rowing-boat.mp3', name: '碧面小舟摇桨', url: '/music/white_noise/transport/rowing-boat.mp3' },
      { id: 'transport-sailboat', filename: 'sailboat.mp3', name: '随浪轻荡帆船', url: '/music/white_noise/transport/sailboat.mp3' },
      { id: 'transport-submarine', filename: 'submarine.mp3', name: '深海潜艇雷达音', url: '/music/white_noise/transport/submarine.mp3' },
      { id: 'transport-train', filename: 'train.mp3', name: '钢轨隆隆鸣笛起伏', url: '/music/white_noise/transport/train.mp3' }
    ]
  },
  {
    id: 'urban',
    name: '市井喧哗',
    sounds: [
      { id: 'urban-ambulance-siren', filename: 'ambulance-siren.mp3', name: '远程救护警笛声', url: '/music/white_noise/urban/ambulance-siren.mp3' },
      { id: 'urban-busy-street', filename: 'busy-street.mp3', name: '喧嚣十字街口', url: '/music/white_noise/urban/busy-street.mp3' },
      { id: 'urban-crowd', filename: 'crowd.mp3', name: '闹市来往行人碎步', url: '/music/white_noise/urban/crowd.mp3' },
      { id: 'urban-fireworks', filename: 'fireworks.mp3', name: '远空绽放礼花', url: '/music/white_noise/urban/fireworks.mp3' },
      { id: 'urban-highway', filename: 'highway.mp3', name: '高速公路车流划过', url: '/music/white_noise/urban/highway.mp3' },
      { id: 'urban-road', filename: 'road.mp3', name: '人行街道熙攘', url: '/music/white_noise/urban/road.mp3' },
      { id: 'urban-traffic', filename: 'traffic.mp3', name: '晚霞车水马龙', url: '/music/white_noise/urban/traffic.mp3' }
    ]
  }
];

export function getSoundById(soundId: string): NoiseSound | undefined {
  for (const cat of NOISE_CATALOG) {
    const sound = cat.sounds.find(s => s.id === soundId);
    if (sound) return sound;
  }
  // Fallbacks for compatibility with legacy preloaded items
  if (soundId === 'bowl') {
    return { id: 'things-singing-bowl', filename: 'singing-bowl.mp3', name: '精纯梵意颂钵', url: '/music/white_noise/things/singing-bowl.mp3' };
  }
  if (soundId === 'rain') {
    return { id: 'rain-light-rain', filename: 'light-rain.mp3', name: '林间淅淅微雨', url: '/music/white_noise/rain/light-rain.mp3' };
  }
  if (soundId === 'wind') {
    return { id: 'nature-wind', filename: 'wind.mp3', name: '旷原轻柔清风', url: '/music/white_noise/nature/wind.mp3' };
  }
  if (soundId === 'thunder') {
    return { id: 'rain-thunder', filename: 'thunder.mp3', name: '远天阵阵滚雷', url: '/music/white_noise/rain/thunder.mp3' };
  }
  if (soundId === 'ocean') {
    return { id: 'nature-waves', filename: 'waves.mp3', name: '温柔落潮拍岸', url: '/music/white_noise/nature/waves.mp3' };
  }
  if (soundId === 'crackle') {
    return { id: 'nature-campfire', filename: 'campfire.mp3', name: '噼啪柴火篝火', url: '/music/white_noise/nature/campfire.mp3' };
  }
  return undefined;
}
