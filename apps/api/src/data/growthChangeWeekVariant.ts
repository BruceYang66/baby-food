type GrowthChangeMetricItemRecord = {
  title: string
  value: string
  note?: string
}

type GrowthChangeDailyItemRecord = {
  title?: string
  description: string
}

type GrowthChangeStageShape = {
  key: string
  label: string
  startWeek: number
  endWeek: number | null
  overviewTitle: string
  overviewSummary: string
  highlights: string[]
  metricItems: GrowthChangeMetricItemRecord[]
  dailyItems: GrowthChangeDailyItemRecord[]
  sourceNote: string
}

type GrowthChangeWeekVariantBank = {
  titles: string[]
  summaries: string[]
  highlights: string[]
  dailyItems: GrowthChangeDailyItemRecord[]
}

const growthChangeWeekVariantBanks: Record<string, GrowthChangeWeekVariantBank> = {
  '0-12w': {
    titles: ['追视和安抚回应逐步更稳定', '抬头力量和清醒互动继续建立', '昼夜节律和亲子回应在慢慢形成', '感官输入和安全感体验更重要', '头颈控制与熟悉声音辨认增强'],
    summaries: [
      '这一周继续关注宝宝追视、抬头、对声音的回应和安抚后的平复速度，照护上以稳定喂养、睡眠节律和高质量互动为主。',
      '宝宝在清醒时的目光停留、身体舒展和安抚反应会更明显，规律喂养与温和互动仍是本周重点。',
      '本周可以继续观察宝宝头颈力量、对熟悉面孔的专注度，以及安静醒着时愿不愿意看、听、回应周围。',
      '这个阶段的成长更多体现在回应、感官和节律建立上，稳定照护、俯趴和温柔语言都很关键。',
      '宝宝本周的变化重点仍在头颈控制、对人声与表情的回应，以及逐步形成更稳定的作息节律。'
    ],
    highlights: ['清醒时继续短时俯趴', '多做对视和温和回应', '观察哭声和安抚方式变化', '优先稳住喂养与睡眠节律', '减少过多环境刺激', '洗澡和抚触时多做语言输入'],
    dailyItems: [
      { title: '俯趴', description: '清醒时安排短时间俯趴，有助于头颈和肩背力量慢慢建立。' },
      { title: '对视', description: '你靠近说话时，宝宝会更专注地看着脸部和嘴型。' },
      { title: '追视', description: '喂奶后安静醒着时，可以用黑白图卡或轻柔玩具做追视互动。' },
      { title: '安抚', description: '抱起和放下时动作尽量稳定，能帮助宝宝建立更多安全感。' },
      { title: '表达', description: '宝宝会继续通过不同哭声表达需求，照护者可以慢慢分辨差异。' },
      { title: '感官', description: '洗澡、更衣和抚触时的温和语言，是重要的感官输入。' },
      { title: '节律', description: '规律喂养和昼夜分化，会帮助宝宝形成更稳定的生活节律。' },
      { title: '听觉', description: '熟悉的声音和固定的安抚语，会让宝宝更容易平静下来。' },
      { title: '睡眠', description: '白天醒着的短互动和夜间安静环境，都有助于睡眠节律建立。' }
    ]
  },
  '13-24w': {
    titles: ['翻身、抓握和发声更活跃', '手眼协调与支撑坐准备增强', '辅食准备信号开始被看见', '自由活动和模仿回应更明显', '翻身探索与口欲行为同步增加'],
    summaries: [
      '宝宝会更主动地伸手、翻身和发声，也开始对食物和餐桌产生兴趣。本周重点是大运动和手眼协调，以及继续观察辅食准备信号。',
      '本周可以重点看宝宝翻身、抬胸、双手抓握和对大人说话的回应，这些都是早期运动与交流发展的表现。',
      '宝宝对环境和餐桌的注意力会更强，但照护重点仍然是奶量、节律和发育信号，而不是提前加辅食。',
      '这一周更值得关注头颈控制、地面活动时间和主动抓物表现，为后续坐稳和正式加辅食做准备。',
      '宝宝会更愿意看、抓、发声和翻身，照护上可以多创造安全、可互动的地面探索空间。'
    ],
    highlights: ['观察头颈是否能稳定支撑', '鼓励伸手抓玩具与换手', '多留自由翻身时间', '看到食物感兴趣不等于能马上加辅食', '回应咿呀发声与表情变化', '按需喂养仍是核心'],
    dailyItems: [
      { title: '口欲', description: '宝宝会更喜欢把手边玩具往嘴里送，这是正常的口欲和探索行为。' },
      { title: '活动', description: '地垫上的自由活动时间，会帮助翻身和身体协调更快发展。' },
      { title: '餐桌', description: '看到大人吃饭时更专注，是社交模仿的一部分，不代表一定要提前加辅食。' },
      { title: '回应', description: '和宝宝说话时，宝宝可能会用更响亮的咿呀声回应你。' },
      { title: '抓握', description: '让宝宝练习双手抓握、换手拿物，有助于手眼协调发展。' },
      { title: '靠坐', description: '头颈支撑更稳时，可以短时间练习靠坐观察周围。' },
      { title: '节律', description: '保持作息和喂养节律稳定，比频繁尝试新刺激更重要。' },
      { title: '表情', description: '宝宝会更愿意通过表情、踢腿和挥手表达兴奋与喜欢。' },
      { title: '互动', description: '面对面的微笑、模仿和说话，会让宝宝更愿意发声回应。' }
    ]
  },
  '25-36w': {
    titles: ['独坐更稳，口手探索继续升级', '辅食节律和咀嚼体验同步推进', '名字回应与模仿发声更明显', '抓握进食兴趣和地面活动都在增加', '补铁、坐稳与手口探索一起发展'],
    summaries: [
      '进入正式辅食阶段后，宝宝通常会更稳定地坐着、主动抓取物品，也更愿意用嘴和手共同探索世界。本周重点是补铁、咀嚼体验和自主参与。',
      '这一周可以重点看宝宝能否更稳地坐着、对勺子和食物的兴趣、以及对熟悉称呼的回应变化。',
      '辅食节律建立后，宝宝在模仿、伸手抓和看餐具方面都会更主动，照护上需要给足探索空间。',
      '本周更值得观察独坐稳定度、地面活动、餐桌参与感，以及对新食材和新质地的接受度。',
      '宝宝会在坐、抓、看、听和吃这几件事上同时进步，家长可以多做回应式互动和少量多次尝试。'
    ],
    highlights: ['继续优先补铁', '从细腻到略有颗粒逐步过渡', '允许宝宝用手参与进食探索', '继续多做地面活动', '多把动作和语言配对输入', '观察对新食材的接受度'],
    dailyItems: [
      { title: '坐姿', description: '宝宝坐得更稳后，会更愿意盯着勺子和碗看，也可能主动伸手抓。' },
      { title: '食材', description: '新食材一次只加一种，连续观察几天，是这个阶段很重要的节奏。' },
      { title: '探索', description: '除了吃进去多少，也要观察宝宝是否愿意看、摸、闻、舔新的食物。' },
      { title: '自主', description: '给宝宝留一些自己抓握食物或餐具的机会，有助于自主进食启蒙。' },
      { title: '称呼', description: '宝宝听到熟悉称呼时反应更快，可以多把照护动作和语言配对起来。' },
      { title: '活动', description: '清醒活动时多在地面玩，能帮助核心稳定和后续爬行准备。' },
      { title: '作息', description: '辅食节律建立后，作息通常也会更容易稳定下来。' },
      { title: '发声', description: '模仿大人的音节和节奏会变多，面对面交流更容易得到回应。' },
      { title: '表情', description: '对喜欢的食物和活动，宝宝会用更明显的表情与身体动作表达。' }
    ]
  },
  '37-52w': {
    titles: ['爬行、扶站和模仿互动都更主动', '精细抓握、杯饮和手抓食继续提升', '安全探索和共同注意更明显', '大运动和社交模仿同步增强', '爬、站、拿、看四类能力一起进步'],
    summaries: [
      '宝宝会更主动地靠近目标、模仿动作和声音，也更愿意尝试手抓食。本周重点是安全探索、精细抓握和日常语言输入。',
      '这一周可以继续观察爬行、扶站、捏取小物和对手势语言的模仿，这些都在快速发展。',
      '宝宝对环境和大人的动作更敏感，照护重点是提供安全边界，同时继续鼓励主动尝试。',
      '随着活动量增加，宝宝会更常通过手、眼、动作和表情与人互动，家长可以多做轮流和模仿游戏。',
      '本周的核心仍是安全探索、自主进食和共同注意能力，让宝宝在看、拿、爬和模仿中持续进步。'
    ],
    highlights: ['提供安全爬行和扶站空间', '练习手抓食和杯饮', '多做指认、模仿和轮流互动', '避免误吞风险小物件', '晚餐不过晚不过饱', '继续鼓励主动探索'],
    dailyItems: [
      { title: '手抓食', description: '宝宝会更想自己拿食物吃，手抓食和自主尝试比整洁更重要。' },
      { title: '共同注意', description: '当你指向某个物体时，宝宝可能会顺着看过去，这说明共同注意在发展。' },
      { title: '扶站', description: '爬到你身边、拉着家具站起来，都是常见的大运动进步信号。' },
      { title: '喝水', description: '可以开始让宝宝练习小杯喝水或双耳杯，动作不稳很正常。' },
      { title: '模仿', description: '多重复简单词和动作，比如拍手、挥手、再见，宝宝更容易模仿。' },
      { title: '依恋', description: '陌生环境里更黏照护者，往往是依恋发展更清晰的表现。' },
      { title: '睡眠', description: '晚餐不宜太晚太饱，能帮助夜间睡眠更稳定。' },
      { title: '捏取', description: '捏小块食物和换手拿物的动作会越来越熟练。' },
      { title: '边界', description: '在安全范围内给足探索机会，比频繁抱离现场更能帮助发展。' }
    ]
  },
  '53-78w': {
    titles: ['独走更稳，自主表达和参与感增强', '指令理解、家务参与和餐桌互动更明显', '独立意愿增加，规则感开始建立', '动作更熟练，表达需求也更主动', '吃饭、穿衣和收拾都更想自己来'],
    summaries: [
      '这一阶段宝宝会走、会指、会表达需求，也更容易在吃饭、穿衣和收拾时表现出独立意愿。本周重点是安全独走、简短表达和规律进餐。',
      '本周可以重点观察宝宝能否更稳地走、蹲下再站起，以及是否会用词或动作主动表达需求。',
      '宝宝会更愿意自己拿勺子、自己做选择，家长可以在安全边界内多给尝试机会。',
      '这一周的成长重点仍在动作熟练度、自主参与感和对简短规则的理解与回应。',
      '随着活动和表达都变多，照护上要继续稳住作息、餐桌节律和清晰边界。'
    ],
    highlights: ['鼓励安全独走和上下小台阶练习', '让宝宝参与收拾、递拿和简单选择', '继续坚持规律三餐两点', '多说短句并给回应时间', '户外活动有助于稳定情绪与胃口', '给出少量明确选择更有效'],
    dailyItems: [
      { title: '自主进食', description: '宝宝会更想自己拿勺子、自己选食物，哪怕动作还不熟练，也值得鼓励。' },
      { title: '沟通', description: '指一指、拿给你、再看向你，是宝宝主动沟通在变多的表现。' },
      { title: '探索', description: '当宝宝愿意走来走去探索环境时，安全边界比频繁制止更重要。' },
      { title: '家务游戏', description: '可以把简单家务变成游戏，比如递纸巾、放玩具、收小勺。' },
      { title: '选择', description: '饭桌上给出两个简单选项，会比反复追问更有效。' },
      { title: '词汇', description: '宝宝的词汇量在慢慢积累，重复日常短句比一次讲很多更有帮助。' },
      { title: '作息', description: '当作息稳定、活动充分时，挑食和闹餐通常会更少一些。' },
      { title: '动作', description: '蹲下、转身、停下再走，这些动作会比前几周更协调。' },
      { title: '规则', description: '开始能听懂更多简单边界，比如慢一点、停一下、给妈妈。' }
    ]
  },
  '79-104w': {
    titles: ['跑跳准备、双词表达和规则感开始出现', '模仿说话更频繁，活动量明显增加', '自己来意愿更强，边界和轮流更重要', '短句萌芽、生活规则和餐桌节律一起建立', '走跑转换更熟练，表达与模仿都在升级'],
    summaries: [
      '宝宝运动能力更强，语言理解和表达也在加速发展，会开始用两词表达想法，并尝试按简单规则完成事情。饮食上要继续稳住三餐结构和低盐少糖。',
      '这一周的重点是双词表达、模仿说话、快走小跑和简单规则理解，照护上继续强调固定加餐和稳定边界。',
      '宝宝会更想自己做决定，也更愿意用动作和语言表达需求，本周可以重点看活动量、表达和餐桌节律。',
      '随着精力和表达能力都在增强，规则感、轮流意识和日常短句会成为这一周更值得关注的变化。',
      '本周成长重点仍在运动、表达和生活规则三个方面，家长可以多给回应、示范和清晰边界。'
    ],
    highlights: ['多做走、蹲、跨和推拉类活动', '回应双词表达，扩展成短句', '零食固定时段，不过度加餐', '及时稳定地给出边界反馈', '多做日常对话和模仿游戏', '继续保持低盐少糖'],
    dailyItems: [
      { title: '早餐结构', description: '早餐除了蛋白质和碳水，也别忘了搭配蔬菜或水果，帮助一天更有活力。' },
      { title: '边界', description: '当宝宝出现推人、咬人等行为时，要及时制止，并用稳定语气告诉他边界。' },
      { title: '模仿', description: '宝宝会越来越爱模仿大人说话和做事，这是语言和社会性一起在发展。' },
      { title: '自理', description: '让宝宝自己穿一件衣服、自己递鞋子，会增强我自己来的积极体验。' },
      { title: '运动', description: '现在的宝宝通常很爱动，户外走、跑、推车类活动都能帮助释放精力。' },
      { title: '表达', description: '如果宝宝开始用两个词表达想法，家长可以顺势扩展成更完整的短句。' },
      { title: '晚餐', description: '晚间减少高糖高油小零食，更有利于睡眠和第二天胃口。' },
      { title: '轮流', description: '开始能接受很短的等待和轮流，但仍然需要大人不断示范。' },
      { title: '规则感', description: '固定的收玩具、洗手和坐餐椅流程，会帮助生活规则更稳定。' },
      { title: '短句', description: '多用生活化短句回应宝宝，比如要下楼、先洗手、轮到你。' }
    ]
  },
  '105w+': {
    titles: ['句子表达、想象游戏和自理意愿继续增强', '轮流互动、角色扮演和运动协调同步进步', '短句表达更清晰，生活规则开始内化', '社交回应、自理和大运动都更主动', '讲故事、假装游戏和自主参与持续增加'],
    summaries: [
      '两岁后，宝宝在语言、社会互动和生活自理上会明显进阶，能说更完整的话、参与假装游戏，也更愿意自己完成穿脱、洗手和收拾等动作。',
      '这一周可以重点观察短句表达、角色扮演、轮流互动以及生活自理动作的稳定度，饮食上继续坚持三餐两点。',
      '宝宝会更愿意自己做，也更愿意通过完整短句表达想法，家长可以多做讲述、提问和共读。',
      '本周成长重点仍在语言表达、想象游戏和社交规则，既要鼓励自理，也要温和坚持边界。',
      '随着理解能力增强，宝宝会在讲故事、模仿、运动和收拾这些事情上表现出更多主动性。'
    ],
    highlights: ['继续坚持三餐两点和低盐少糖', '把说话、讲故事和角色扮演融入日常', '鼓励自理但不过度催促速度', '每天安排高质量户外活动', '亲子共读比单向讲更有效', '轮流和等待需要反复示范'],
    dailyItems: [
      { title: '自己来', description: '两岁后的宝宝更愿意自己来，吃饭、穿鞋、洗手都可以让他多试一点。' },
      { title: '讲短句', description: '把日常经历说成短句，会帮助宝宝把词汇慢慢组织成更完整的表达。' },
      { title: '假装游戏', description: '假装给娃娃喂饭、给玩具看病，是很典型的想象游戏发展。' },
      { title: '餐桌节律', description: '如果宝宝总想边玩边吃，规律的餐桌时间和固定零食时段会更重要。' },
      { title: '户外活动', description: '多带宝宝跑跳、踢球、钻爬，可以帮助大运动和情绪调节一起发展。' },
      { title: '轮流等待', description: '开始学会轮流、等待和收拾，但仍然需要大人一次次温和提醒。' },
      { title: '共读', description: '亲子共读时多提问、多描述画面，比单纯读完更能带动语言发展。' },
      { title: '情绪表达', description: '宝宝会更想把喜欢、不愿意和着急说出来，家长可以先接住情绪再讲规则。' },
      { title: '社交', description: '和同龄孩子一起玩时，会更在意轮流、模仿和谁先谁后这类规则。' }
    ]
  }
}

export function applyGrowthChangeWeekVariant<T extends GrowthChangeStageShape>(stage: T, weekNumber: number): T {
  const bank = growthChangeWeekVariantBanks[stage.key]
  if (!bank) {
    return stage
  }

  const weekOffset = Math.max(0, Math.floor(weekNumber) - stage.startWeek)
  const titleIndex = weekOffset % bank.titles.length
  const summaryIndex = weekOffset % bank.summaries.length
  const highlightStart = weekOffset % bank.highlights.length
  const dailyStart = (weekOffset * 2) % bank.dailyItems.length

  const highlights = Array.from({ length: Math.min(3, bank.highlights.length) }, (_, index) => {
    return bank.highlights[(highlightStart + index * 2) % bank.highlights.length]
  })

  const dailyItems = Array.from({ length: 7 }, (_, index) => {
    return bank.dailyItems[(dailyStart + index) % bank.dailyItems.length]
  })

  return {
    ...stage,
    overviewTitle: bank.titles[titleIndex] ?? stage.overviewTitle,
    overviewSummary: bank.summaries[summaryIndex] ?? stage.overviewSummary,
    highlights,
    dailyItems
  }
}
