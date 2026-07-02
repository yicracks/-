// Multi-language translation utility for English default and Chinese sub-route
import { NOISE_CATALOG } from './noiseCatalog';

export type Lang = 'en' | 'zh';

// Translation dictionary
export const DICTIONARY: Record<Lang, Record<string, string>> = {
  zh: {
    // Header & Tabs
    'app.title': '曼陀罗催眠',
    'app.subtitle': 'SOOTHING DRAWING',
    'tab.player': '催眠播放器',
    'tab.canvas': '曼陀罗画制作',
    'tab.mixer': '催眠混音制作',
    'tab.creations': '我的作品',
    'btn.settings': '设置',
    'title.settings': '高级设置',
    
    // Sidebar / Draw Settings
    'sidebar.title': '曼陀罗创作',
    'draw.symmetry': '对称轴数量',
    'draw.axes': '外轴',
    'draw.brushSize': '画笔粗细',
    'draw.color': '舒缓色调/画笔颜色',
    'draw.colorPicker': '高级调色盘:',
    'draw.evolution': '动态演化模式',
    'draw.static': '静态画卷',
    'draw.dynamic': '动态效果',
    'draw.editorControls': '编辑选项',
    'draw.undo': '撤销',
    'draw.redo': '重做',
    'draw.clear': '清空',
    'draw.save': '保存画作',
    'draw.export': '导出画作',

    // Floating Toolbar Tools
    'tool.brush': '画笔 (Brush)',
    'tool.line': '直线 (Line)',
    'tool.curve': '弧线 (Curve)',
    'tool.circle': '圆形 (Circle)',
    'tool.ellipse': '椭圆 (Ellipse)',
    'tool.rect': '矩形 (Rectangle)',
    'tool.leaf': '花叶 (Leaf)',
    'tool.star': '精细星芒 (Star)',
    'tool.moon': '月晕 (Moon)',

    // Sleep Player
    'player.title': '伴眠画境播放器',
    'player.presetLabel': '睡眠音轨预设',
    'player.ambientLabel': '环境交织音量',
    'player.controlLabel': '播放控制',
    'player.guideLabel': '吸气呼气呼吸指引声',
    'player.decayLabel': '倒计时缓退机制',
    'player.decayMin': '分钟',
    'player.decayEnabled': '缓退倒计时开启中',
    'player.decayDisabled': '倒计时未开启',
    'player.play': '播放',
    'player.pause': '暂停',
    'player.prev': '上一个',
    'player.next': '下一个',
    'player.settings': '播放选项',
    'player.interactive': '联动曼陀罗设定',
    'player.breathGuide': '正念呼吸指引 (吸气/呼气/屏气)',
    'player.breathInhale': '吸气',
    'player.breathHold': '屏气',
    'player.breathExhale': '呼气',
    'player.noTracks': '暂无可选音轨，赶紧制作属于您的混音吧',
    'player.volume': '主音量',
    'player.backToGallery': '回到画库选择',
    'player.selectedMandala': '正在呈现画作:',
    'player.defaultDesign': '默认神圣经典设计',
    'player.createdDesign': '我的专属手绘面',
    'player.emptyCreationText': '还没有手绘自己的曼陀罗，绘制一个更好的吧',
    'player.drawingCall': '前往手绘专属曼陀罗',

    // Sound Mixer
    'mixer.title': '深度白噪音白日梦混音台',
    'mixer.desc': '调配大自然的万象之音，加入播音朗读，烘托出极致松弛的夜间助眠音境',
    'mixer.status': '混音配比表',
    'mixer.newTrack': '新建音频图层',
    'mixer.trackType': '源信号类型',
    'mixer.typeBuiltin': '预设大自然白噪音',
    'mixer.typeTts': '播音朗读 (TTS 语音合成)',
    'mixer.typeMic': '麦克风即兴录制',
    'mixer.typeImport': '本地文件导入',
    'mixer.natureSound': '声源选择',
    'mixer.ttsPlaceholder': '输入用于背景周期的诵读、睡前故事或自我肯定。例如：“吸气，呼气，整个世界在这一刻安宁...”',
    'mixer.ttsLabel': '输入朗读文本',
    'mixer.micStart': '点击开始录制 (最长60秒)',
    'mixer.micStop': '点击完成录制',
    'mixer.micSim': '正在模拟舒缓声频发生器 (麦克风)...',
    'mixer.importBtn': '选择音轨文件 (.mp3 / .wav)',
    'mixer.trackName': '自定义图层名称',
    'mixer.trackSpeed': '音轨质感倍速 (调速)',
    'mixer.trackPitch': '音轨音高 (高或低)',
    'mixer.trackVol': '原始配比音量',
    'mixer.addConfirm': '确认注入此音频层',
    'mixer.audiblePlay': '停止试听',
    'mixer.audibleStop': '音频试听',
    'mixer.createPreset': '封存为我的专属睡眠轨道',
    'mixer.mixerSaveName': '写一个梦境歌单名称...',
    'mixer.activeNum': '当前共注入 {count} 条音轨源',
    'mixer.saveTrackBtn': '生成并保存此专属催眠轨道',
    'mixer.audibleTip': '可以开启“音频试听”实时混合感知您的创作。',

    // My Creations
    'creations.title': '我的专属作品集',
    'creations.mandalas': '制作的曼陀罗图案',
    'creations.tracks': '生成的睡眠催眠音轨',
    'creations.drawNew': '绘制新画布',
    'creations.mixNew': '调配新混音',
    'creations.emptyMandala': '暂无保存的手绘。到 [曼陀罗画制作] 中，发挥您的无限想象吧！',
    'creations.emptyTrack': '暂无定制的混音音轨。进入 [催眠混音制作] 中，调配出大自然交响乐！',
    'creations.delete': '删除',
    'creations.play': '载入播放',
    'creations.export': '导出音频',
    'creations.runningExport': '正在渲染高质量立体声中...',
    'creations.cancel': '取消',
    'creations.untitled': '未命名的画卷',
    'creations.untitledTrack': '未命名的睡前音轨',

    // Modal Preferences
    'pref.appearance': '外观与质感个性化',
    'pref.about': '关于与设计初衷',
    'pref.theme': '主题选择',
    'pref.themeDay': '宁静冬日 (暖橘昼)',
    'pref.themeEye': '绿野仙踪 (护眼浅绿)',
    'pref.themeNight': '深邃暗夜 (舒眠暗)',
    'pref.themeCustom': '梦境自定义色调',
    'pref.fade': '全景式倒计时音量缓退机制（科学防耳机炸耳伤听力）',
    'pref.accent': '自定义氛围背景颜色',
    'pref.info': '曼陀罗催眠是集正念创作与自然疗愈于一体的夜间心理辅助催眠程序。结合了交互对称绘画与立体声混音，让每一次的线条流动都能释放情绪，每一次的波形交织都能舒缓紧张。',
    'pref.close': '关闭',
    'pref.language': '应用展示语言 (Language)',
  },
  en: {
    // Header & Tabs
    'app.title': 'Zen Mandala',
    'app.subtitle': 'SOOTHING DRAWING',
    'tab.player': 'Sleep Player',
    'tab.canvas': 'Mandala Canvas',
    'tab.mixer': 'Sound Mixer',
    'tab.creations': 'My Creations',
    'btn.settings': 'Settings',
    'title.settings': 'Advanced Preferences',

    // Sidebar / Draw Settings
    'sidebar.title': 'Mandala Creator',
    'draw.symmetry': 'Symmetry Count',
    'draw.axes': 'Axes',
    'draw.brushSize': 'Brush Thickness',
    'draw.color': 'Soothe Shading / Brush Color',
    'draw.colorPicker': 'Advanced Color Palette:',
    'draw.evolution': 'Dynamic Evolution Mode',
    'draw.static': 'Static Artwork',
    'draw.dynamic': 'Continuous Zoom',
    'draw.editorControls': 'Editor Options',
    'draw.undo': 'Undo',
    'draw.redo': 'Redo',
    'draw.clear': 'Clear All',
    'draw.save': 'Save Artwork',
    'draw.export': 'Export Image',

    // Floating Toolbar Tools
    'tool.brush': 'Brush',
    'tool.line': 'Straight Line',
    'tool.curve': 'Soothe Curve',
    'tool.circle': 'Perfect Circle',
    'tool.ellipse': 'Cosmic Ellipse',
    'tool.rect': 'Soft Rectangle',
    'tool.leaf': 'Petal / Leaf',
    'tool.star': 'Delicate Star',
    'tool.moon': 'Luminous Moon',

    // Sleep Player
    'player.title': 'Sleep Ambience Space',
    'player.presetLabel': 'Premium Ambience Presets',
    'player.ambientLabel': 'Layer Sound Mixer Volumes',
    'player.controlLabel': 'Playback Actions',
    'player.guideLabel': 'Mindful Deep-Breathing Guide Speech',
    'player.decayLabel': 'Soothe Timer Volume Fade-Out',
    'player.decayMin': 'Minutes',
    'player.decayEnabled': 'Fade-out countdown timer running',
    'player.decayDisabled': 'Countdown not active',
    'player.play': 'Play',
    'player.pause': 'Pause',
    'player.prev': 'Previous',
    'player.next': 'Next',
    'player.settings': 'Player Settings',
    'player.interactive': 'Sync Drawing Frame',
    'player.breathGuide': 'Mindful Resonance Guide (Inhale/Exhale/Hold)',
    'player.breathInhale': 'Inhale',
    'player.breathHold': 'Hold Breath',
    'player.breathExhale': 'Exhale',
    'player.noTracks': 'No custom soundtracks found, create your premium mix now!',
    'player.volume': 'Master Audio',
    'player.backToGallery': 'Back to Gallery',
    'player.selectedMandala': 'Active Mandala:',
    'player.defaultDesign': 'Sacred Geometric Motif',
    'player.createdDesign': 'My Custom Handdrawn Design',
    'player.emptyCreationText': 'You haven\'t sketched a custom mandala yet. Design one now!',
    'player.drawingCall': 'Go to Canvas & Sketch',

    // Sound Mixer
    'mixer.title': 'Deep Ambiance & Wave Mixer',
    'mixer.desc': 'Curate and layer nature acoustics, self-affirmation speeches, and spatial sounds into the ultimate acoustic sleep aid.',
    'mixer.status': 'Mix Ratio Board',
    'mixer.newTrack': 'Add Sound Element Layer',
    'mixer.trackType': 'Signal Input Source',
    'mixer.typeBuiltin': 'Integrated Nature Acoustics',
    'mixer.typeTts': 'Pre-sleep Affirmation (Speech Synthesizer)',
    'mixer.typeMic': 'Microphone Live Record',
    'mixer.typeImport': 'Import Local Audio File',
    'mixer.natureSound': 'Available Sound Sources',
    'mixer.ttsPlaceholder': 'Enter affirmation, soothing sleep stories or guidance, e.g. "Inhale, exhale, feel the entire world resting in quietness..."',
    'mixer.ttsLabel': 'Affirmation Text Speech',
    'mixer.micStart': 'Tap to Record (Max 60 seconds)',
    'mixer.micStop': 'Stop Recording',
    'mixer.micSim': 'Simulating audio frequency capture (Microphone)...',
    'mixer.importBtn': 'Select Audio File (.mp3 / .wav)',
    'mixer.trackName': 'Custom Layer Title',
    'mixer.trackSpeed': 'Playback Rate / Speed',
    'mixer.trackPitch': 'Acoustic Pitch Filter',
    'mixer.trackVol': 'Base Layer Volume',
    'mixer.addConfirm': 'Confirm Infusing This Layer',
    'mixer.audiblePlay': 'Stop Audition',
    'mixer.audibleStop': 'Live Audition',
    'mixer.createPreset': 'Save Soundtrack Preset',
    'mixer.mixerSaveName': 'Name your starry playlist...',
    'mixer.activeNum': 'Infused {count} audio layers currently',
    'mixer.saveTrackBtn': 'Compile and Save Custom Sleep Track',
    'mixer.audibleTip': 'Toggle "Live Audition" to blend sound layers in real-time as you tweak.',

    // My Creations
    'creations.title': 'My Unique Art Collection',
    'creations.mandalas': 'Saved Mandalas & Artworks',
    'creations.tracks': 'Custom Soundtracks & Blends',
    'creations.drawNew': 'Draw New Canvas',
    'creations.mixNew': 'Blend New Sounds',
    'creations.emptyMandala': 'No saved sketches found. Head over to [Mandala Canvas] and express your imagination!',
    'creations.emptyTrack': 'No custom sleep tracks found. Explore [Sound Mixer] and orchestrate your cozy harmony!',
    'creations.delete': 'Delete',
    'creations.play': 'Load and Play',
    'creations.export': 'Render WAV',
    'creations.runningExport': 'Rendering high-fidelity spatial stereo...',
    'creations.cancel': 'Cancel',
    'creations.untitled': 'Mysterious Motif',
    'creations.untitledTrack': 'Starry Dream Sequence',

    // Modal Preferences
    'pref.appearance': 'Appearance & Theme Styling',
    'pref.about': 'About & Design Philosophy',
    'pref.theme': 'Visual Theme Selection',
    'pref.themeDay': 'Golden Hearth (Warm Day)',
    'pref.themeEye': 'Whispering Forest (Eye Care Green)',
    'pref.themeNight': 'Midnight Cosmos (Comforting Dark)',
    'pref.themeCustom': 'Bespoke Dream Hue',
    'pref.fade': 'Soothing Fade-Out Timer (Protects auditory health and ears automatically)',
    'pref.accent': 'Ambient Stage Background Hue',
    'pref.info': 'Zen Mandala is an interactive art therapy and acoustic healing sleep suite. Pairing real-time symmetrical geometric sketching with multi-layered customizable natural soundtracks allows thoughts to stream and dissolve peacefully.',
    'pref.close': 'Dismiss',
    'pref.language': 'Language Settings',
  }
};

// Translate function helper
export function t(lang: Lang, key: string, params: Record<string, any> = {}): string {
  const dictionary = DICTIONARY[lang] || DICTIONARY.en;
  let text = dictionary[key] ?? DICTIONARY.en[key] ?? key;
  
  Object.keys(params).forEach(p => {
    text = text.replace(`{${p}}`, String(params[p]));
  });
  
  return text;
}

// Map database sound catalog names dynamic translation helper
export function translateSoundName(lang: Lang, soundId: string, originalChinese: string): string {
  if (lang === 'zh') return originalChinese;
  
  const translations: Record<string, string> = {
    // Nature
    'nature-wind': 'Whispering Plains Wind',
    'nature-waves': 'Gentle Rolling Waves',
    'nature-campfire': 'Warm Crackling campfire',
    'nature-birds': 'Lively Spring Forest Birds',
    'nature-cave-drips': 'Ancient Cave Water Drops',
    'nature-storm-wind': 'Vast Coastal Gales',
    
    // Rain
    'rain-heavy-rain': 'Thundering Pouring Downpour',
    'rain-light-rain': 'Soft Pine Forest Drizzle',
    'rain-rain-on-car-roof': 'Pitter Patter Rain on Roof',
    'rain-rain-on-leaves': 'Raindrop Tapestry on Leaves',
    'rain-rain-on-tent': 'Rain pattering on Tent Canvas',
    'rain-rain-on-umbrella': 'Misty Rain of Umbrellas',
    'rain-rain-on-window': 'Soft Rain Tap on Window',
    'rain-thunder': 'Resonant Distant Thunder',
    
    // Things
    'things-boiling-water': 'Teakettle Soft Boiling',
    'things-bubbles': 'Soothing Water Bubbles Pop',
    'things-ceiling-fan': 'Vintage Ceiling Fan Rotation',
    'things-clock': 'Midnight Grandfather Clock Ticks',
    'things-dryer': 'Fluffy Tumbling Dryer Whirl',
    'things-keyboard': 'Rhythmic Mechanical typing',
    'things-morse-code': 'Soft Vintage Morse Telegraph',
    'things-paper': 'Rustic Parchment Page Flipping',
    'things-singing-bowl': 'Resonating Tibetean Singing Bowl',
    'things-slide-projector': 'Retro Slide Projector clicking',
    'things-tuning-radio': 'Analog AM Radio White Noise',
    'things-typewriter': 'Classic Typewriter Key Clack',
    'things-vinyl-effect': 'Cozy Vinyl Needle Crackle',
    'things-washing-machine': 'Rhythmic Wash Cycle Hum',
    'things-wind-chimes': 'Ethereal Bamboo Wind Chimes',
    'things-windshield-wipers': 'Rhythmic Windshield Wipers',
    
    // Transport
    'transport-airplane': 'Cozy Cabin Aircraft Noise',
    'transport-inside-a-train': 'Swaying Midnight Train Cabin',
    'transport-rowing-boat': 'Gentle Lake Wooden Oars Splash',
    'transport-sailboat': 'Rolling Waves Sailing Mast Creak',
    'transport-submarine': 'Deep Underwater Radar Echo',
    'transport-train': 'Rolling Steel Track Horn Reverberation',
    
    // Urban
    'urban-ambulance-siren': 'Distant City Ambulance Siren',
    'urban-busy-street': 'Active Pedestrian Avenue Sound',
    'urban-crowd': 'Soothing Urban Walkers Chatter',
    'urban-fireworks': 'Far Sky Festival Fireworks Cracks',
    'urban-highway': 'Seamless Motorway Traffic Flow',
    'urban-road': 'Gentle City Sidewalk Ambience',
    'urban-traffic': 'Sunset Distant Traffic Waves',
  };

  // Check if it matches prefixes
  if (translations[soundId]) {
    return translations[soundId];
  }

  // Fallback translating for BGM dynamically
  if (soundId.startsWith('bgm-')) {
    let clean = soundId.replace(/^bgm-/, '')
      .replace(/^shorts_by_pazuzustudio-/, '')
      .replace(/^shorts_by_/, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    
    // Capitalize words
    clean = clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return clean;
  }

  return originalChinese;
}

// Convert preset track name directly
export function translateTrackPresetName(lang: Lang, trackId: string, originalChinese: string): string {
  if (lang === 'zh') return originalChinese;
  
  const presets: Record<string, string> = {
    'track-default-calming-night': 'Serene Night Garden (Harp & Crickets)',
    'track-default-cozy-rain': 'Warm Cozy Rain (Meditative Harp)',
    'track-default-magical-forest': 'Magical Forest Twilight (Enchanting Bells)',
    'track-default-peaceful-midnight': 'Song of Peaceful Midnight (Summer Crickets)',
    'track-default-soft-tide': 'Gentle Tides & Ripples (Soothe Piano)',
    'track-default-soul-frequencies': '528Hz Soul Frequency (Zen Meditation)'
  };
  
  return presets[trackId] || originalChinese;
}
