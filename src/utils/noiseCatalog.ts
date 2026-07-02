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
    name: '动物',
    sounds: [
      { id: 'animals-beehive', filename: 'beehive.mp3', name: '蜂群', url: '/music/white_noise/animals/beehive.mp3' },
      { id: 'animals-birds', filename: 'birds.mp3', name: '鸟鸣', url: '/music/white_noise/animals/birds.mp3' },
      { id: 'animals-cat-purring', filename: 'cat-purring.mp3', name: '猫咪呼噜', url: '/music/white_noise/animals/cat-purring.mp3' },
      { id: 'animals-chickens', filename: 'chickens.mp3', name: '鸡鸣', url: '/music/white_noise/animals/chickens.mp3' },
      { id: 'animals-cows', filename: 'cows.mp3', name: '牛哞', url: '/music/white_noise/animals/cows.mp3' },
      { id: 'animals-crickets', filename: 'crickets.mp3', name: '蟋蟀', url: '/music/white_noise/animals/crickets.mp3' },
      { id: 'animals-crows', filename: 'crows.mp3', name: '鸦鸣', url: '/music/white_noise/animals/crows.mp3' },
      { id: 'animals-dog-barking', filename: 'dog-barking.mp3', name: '犬吠', url: '/music/white_noise/animals/dog-barking.mp3' },
      { id: 'animals-frog', filename: 'frog.mp3', name: '蛙鸣', url: '/music/white_noise/animals/frog.mp3' },
      { id: 'animals-horse-gallop', filename: 'horse-gallop.mp3', name: '马蹄', url: '/music/white_noise/animals/horse-gallop.mp3' },
      { id: 'animals-owl', filename: 'owl.mp3', name: '猫头鹰', url: '/music/white_noise/animals/owl.mp3' },
      { id: 'animals-seagulls', filename: 'seagulls.mp3', name: '海鸥', url: '/music/white_noise/animals/seagulls.mp3' },
      { id: 'animals-sheep', filename: 'sheep.mp3', name: '绵羊', url: '/music/white_noise/animals/sheep.mp3' },
      { id: 'animals-whale', filename: 'whale.mp3', name: '鲸歌', url: '/music/white_noise/animals/whale.mp3' },
      { id: 'animals-wolf', filename: 'wolf.mp3', name: '狼嚎', url: '/music/white_noise/animals/wolf.mp3' },
      { id: 'animals-woodpecker', filename: 'woodpecker.mp3', name: '啄木鸟', url: '/music/white_noise/animals/woodpecker.mp3' }
    ]
  },
  {
    id: 'binaural',
    name: '脑波',
    sounds: [
      { id: 'binaural-alpha', filename: 'binaural-alpha.wav', name: 'Alpha脑波', url: '/music/white_noise/binaural/binaural-alpha.wav' },
      { id: 'binaural-beta', filename: 'binaural-beta.wav', name: 'Beta脑波', url: '/music/white_noise/binaural/binaural-beta.wav' },
      { id: 'binaural-delta', filename: 'binaural-delta.wav', name: 'Delta脑波', url: '/music/white_noise/binaural/binaural-delta.wav' },
      { id: 'binaural-gamma', filename: 'binaural-gamma.wav', name: 'Gamma脑波', url: '/music/white_noise/binaural/binaural-gamma.wav' },
      { id: 'binaural-theta', filename: 'binaural-theta.wav', name: 'Theta脑波', url: '/music/white_noise/binaural/binaural-theta.wav' }
    ]
  },
  {
    id: 'nature',
    name: '自然',
    sounds: [
      { id: 'nature-campfire', filename: 'campfire.mp3', name: '篝火', url: '/music/white_noise/nature/campfire.mp3' },
      { id: 'nature-droplets', filename: 'droplets.mp3', name: '水滴', url: '/music/white_noise/nature/droplets.mp3' },
      { id: 'nature-howling-wind', filename: 'howling-wind.mp3', name: '风声呼啸', url: '/music/white_noise/nature/howling-wind.mp3' },
      { id: 'nature-jungle', filename: 'jungle.mp3', name: '雨林', url: '/music/white_noise/nature/jungle.mp3' },
      { id: 'nature-river', filename: 'river.mp3', name: '溪流', url: '/music/white_noise/nature/river.mp3' },
      { id: 'nature-walk-in-snow', filename: 'walk-in-snow.mp3', name: '雪地漫步', url: '/music/white_noise/nature/walk-in-snow.mp3' },
      { id: 'nature-walk-on-gravel', filename: 'walk-on-gravel.mp3', name: '石子路漫步', url: '/music/white_noise/nature/walk-on-gravel.mp3' },
      { id: 'nature-walk-on-leaves', filename: 'walk-on-leaves.mp3', name: '落叶漫步', url: '/music/white_noise/nature/walk-on-leaves.mp3' },
      { id: 'nature-waterfall', filename: 'waterfall.mp3', name: '瀑布', url: '/music/white_noise/nature/waterfall.mp3' },
      { id: 'nature-waves', filename: 'waves.mp3', name: '海浪', url: '/music/white_noise/nature/waves.mp3' },
      { id: 'nature-wind-in-trees', filename: 'wind-in-trees.mp3', name: '林间风声', url: '/music/white_noise/nature/wind-in-trees.mp3' },
      { id: 'nature-wind', filename: 'wind.mp3', name: '风声', url: '/music/white_noise/nature/wind.mp3' }
    ]
  },
  {
    id: 'noise',
    name: '噪声',
    sounds: [
      { id: 'noise-brown-noise', filename: 'brown-noise.wav', name: '褐色噪声', url: '/music/white_noise/noise/brown-noise.wav' },
      { id: 'noise-pink-noise', filename: 'pink-noise.wav', name: '粉红噪声', url: '/music/white_noise/noise/pink-noise.wav' },
      { id: 'noise-white-noise', filename: 'white-noise.wav', name: '白噪声', url: '/music/white_noise/noise/white-noise.wav' }
    ]
  },
  {
    id: 'places',
    name: '空间',
    sounds: [
      { id: 'places-airport', filename: 'airport.mp3', name: '机场', url: '/music/white_noise/places/airport.mp3' },
      { id: 'places-cafe', filename: 'cafe.mp3', name: '咖啡馆', url: '/music/white_noise/places/cafe.mp3' },
      { id: 'places-carousel', filename: 'carousel.mp3', name: '旋转木马', url: '/music/white_noise/places/carousel.mp3' },
      { id: 'places-church', filename: 'church.mp3', name: '钟声', url: '/music/white_noise/places/church.mp3' },
      { id: 'places-construction-site', filename: 'construction-site.mp3', name: '施工声', url: '/music/white_noise/places/construction-site.mp3' },
      { id: 'places-crowded-bar', filename: 'crowded-bar.mp3', name: '酒吧', url: '/music/white_noise/places/crowded-bar.mp3' },
      { id: 'places-laboratory', filename: 'laboratory.mp3', name: '实验室', url: '/music/white_noise/places/laboratory.mp3' },
      { id: 'places-laundry-room', filename: 'laundry-room.mp3', name: '洗衣房', url: '/music/white_noise/places/laundry-room.mp3' },
      { id: 'places-library', filename: 'library.mp3', name: '图书馆', url: '/music/white_noise/places/library.mp3' },
      { id: 'places-night-village', filename: 'night-village.mp3', name: '村庄夏夜', url: '/music/white_noise/places/night-village.mp3' },
      { id: 'places-office', filename: 'office.mp3', name: '办公室', url: '/music/white_noise/places/office.mp3' },
      { id: 'places-restaurant', filename: 'restaurant.mp3', name: '餐厅', url: '/music/white_noise/places/restaurant.mp3' },
      { id: 'places-subway-station', filename: 'subway-station.mp3', name: '地铁站', url: '/music/white_noise/places/subway-station.mp3' },
      { id: 'places-supermarket', filename: 'supermarket.mp3', name: '超市', url: '/music/white_noise/places/supermarket.mp3' },
      { id: 'places-temple', filename: 'temple.mp3', name: '寺庙', url: '/music/white_noise/places/temple.mp3' },
      { id: 'places-underwater', filename: 'underwater.mp3', name: '水下', url: '/music/white_noise/places/underwater.mp3' }
    ]
  },
  {
    id: 'rain',
    name: '雨声',
    sounds: [
      { id: 'rain-heavy-rain', filename: 'heavy-rain.mp3', name: '大雨', url: '/music/white_noise/rain/heavy-rain.mp3' },
      { id: 'rain-light-rain', filename: 'light-rain.mp3', name: '小雨', url: '/music/white_noise/rain/light-rain.mp3' },
      { id: 'rain-rain-on-car-roof', filename: 'rain-on-car-roof.mp3', name: '车顶雨声', url: '/music/white_noise/rain/rain-on-car-roof.mp3' },
      { id: 'rain-rain-on-leaves', filename: 'rain-on-leaves.mp3', name: '雨打树叶', url: '/music/white_noise/rain/rain-on-leaves.mp3' },
      { id: 'rain-rain-on-tent', filename: 'rain-on-tent.mp3', name: '帐篷雨声', url: '/music/white_noise/rain/rain-on-tent.mp3' },
      { id: 'rain-rain-on-umbrella', filename: 'rain-on-umbrella.mp3', name: '雨打伞面', url: '/music/white_noise/rain/rain-on-umbrella.mp3' },
      { id: 'rain-rain-on-window', filename: 'rain-on-window.mp3', name: '雨打车窗', url: '/music/white_noise/rain/rain-on-window.mp3' },
      { id: 'rain-thunder', filename: 'thunder.mp3', name: '雷声', url: '/music/white_noise/rain/thunder.mp3' }
    ]
  },
  {
    id: 'things',
    name: '器物',
    sounds: [
      { id: 'things-boiling-water', filename: 'boiling-water.mp3', name: '沸水声', url: '/music/white_noise/things/boiling-water.mp3' },
      { id: 'things-bubbles', filename: 'bubbles.mp3', name: '水泡', url: '/music/white_noise/things/bubbles.mp3' },
      { id: 'things-ceiling-fan', filename: 'ceiling-fan.mp3', name: '吊扇', url: '/music/white_noise/things/ceiling-fan.mp3' },
      { id: 'things-clock', filename: 'clock.mp3', name: '挂钟', url: '/music/white_noise/things/clock.mp3' },
      { id: 'things-dryer', filename: 'dryer.mp3', name: '烘干机', url: '/music/white_noise/things/dryer.mp3' },
      { id: 'things-keyboard', filename: 'keyboard.mp3', name: '键盘', url: '/music/white_noise/things/keyboard.mp3' },
      { id: 'things-morse-code', filename: 'morse-code.mp3', name: '莫尔斯电码', url: '/music/white_noise/things/morse-code.mp3' },
      { id: 'things-paper', filename: 'paper.mp3', name: '翻书声', url: '/music/white_noise/things/paper.mp3' },
      { id: 'things-singing-bowl', filename: 'singing-bowl.mp3', name: '颂钵', url: '/music/white_noise/things/singing-bowl.mp3' },
      { id: 'things-slide-projector', filename: 'slide-projector.mp3', name: '放映机', url: '/music/white_noise/things/slide-projector.mp3' },
      { id: 'things-tuning-radio', filename: 'tuning-radio.mp3', name: '收音机', url: '/music/white_noise/things/tuning-radio.mp3' },
      { id: 'things-typewriter', filename: 'typewriter.mp3', name: '打字机', url: '/music/white_noise/things/typewriter.mp3' },
      { id: 'things-vinyl-effect', filename: 'vinyl-effect.mp3', name: '黑胶唱片', url: '/music/white_noise/things/vinyl-effect.mp3' },
      { id: 'things-washing-machine', filename: 'washing-machine.mp3', name: '洗衣机', url: '/music/white_noise/things/washing-machine.mp3' },
      { id: 'things-wind-chimes', filename: 'wind-chimes.mp3', name: '风铃', url: '/music/white_noise/things/wind-chimes.mp3' },
      { id: 'things-windshield-wipers.mp3', filename: 'windshield-wipers.mp3', name: '雨刷', url: '/music/white_noise/things/windshield-wipers.mp3' }
    ]
  },
  {
    id: 'transport',
    name: '旅途',
    sounds: [
      { id: 'transport-airplane', filename: 'airplane.mp3', name: '飞机舱噪', url: '/music/white_noise/transport/airplane.mp3' },
      { id: 'transport-inside-a-train', filename: 'inside-a-train.mp3', name: '火车包厢', url: '/music/white_noise/transport/inside-a-train.mp3' },
      { id: 'transport-rowing-boat', filename: 'rowing-boat.mp3', name: '划桨', url: '/music/white_noise/transport/rowing-boat.mp3' },
      { id: 'transport-sailboat', filename: 'sailboat.mp3', name: '帆船', url: '/music/white_noise/transport/sailboat.mp3' },
      { id: 'transport-submarine', filename: 'submarine.mp3', name: '潜艇雷达', url: '/music/white_noise/transport/submarine.mp3' },
      { id: 'transport-train', filename: 'train.mp3', name: '火车行驶', url: '/music/white_noise/transport/train.mp3' }
    ]
  },
  {
    id: 'urban',
    name: '都市',
    sounds: [
      { id: 'urban-ambulance-siren', filename: 'ambulance-siren.mp3', name: '警笛', url: '/music/white_noise/urban/ambulance-siren.mp3' },
      { id: 'urban-busy-street', filename: 'busy-street.mp3', name: '繁华街道', url: '/music/white_noise/urban/busy-street.mp3' },
      { id: 'urban-crowd', filename: 'crowd.mp3', name: '人群', url: '/music/white_noise/urban/crowd.mp3' },
      { id: 'urban-fireworks', filename: 'fireworks.mp3', name: '烟花', url: '/music/white_noise/urban/fireworks.mp3' },
      { id: 'urban-highway', filename: 'highway.mp3', name: '公路', url: '/music/white_noise/urban/highway.mp3' },
      { id: 'urban-road', filename: 'road.mp3', name: '街道', url: '/music/white_noise/urban/road.mp3' },
      { id: 'urban-traffic', filename: 'traffic.mp3', name: '车流', url: '/music/white_noise/urban/traffic.mp3' }
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

export function registerBgmSounds(bgmItems: Array<{ filename: string; name: string; url: string }>) {
  let bgmCat = NOISE_CATALOG.find(c => c.id === 'bgm-category');
  if (!bgmCat) {
    bgmCat = {
      id: 'bgm-category',
      name: '伴眠背景乐',
      sounds: []
    };
    NOISE_CATALOG.push(bgmCat);
  }

  bgmCat.sounds = [];

  bgmItems.forEach(item => {
    // Generate id using the filename without extension (keeping it clean and unique)
    const cleanId = `bgm-${item.filename.replace(/\.[^/.]+$/, "")}`;
    const soundItem: NoiseSound = {
      id: cleanId,
      filename: item.filename,
      name: item.name,
      url: item.url
    };
    bgmCat!.sounds.push(soundItem);
  });
}

