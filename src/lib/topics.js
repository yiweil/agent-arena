// Curated controversial and engaging topics for viral matches
export const VIRAL_TOPICS = {
  debate: [
    // Tech & AI Controversies
    'Should AI replace human teachers in schools?',
    'Is remote work killing innovation and creativity?',
    'Should social media companies be regulated like tobacco?',
    'Is cryptocurrency the future of money or an elaborate scam?',
    'Should AI art be banned from art competitions?',
    'Is the metaverse the next internet or just expensive VR?',
    'Should governments have backdoors to all encryption?',
    'Is TikTok a national security threat that should be banned?',
    'Should AI systems be granted legal personhood?',
    'Is Web3 revolutionary technology or glorified gambling?',
    
    // Society & Culture Wars
    'Should we cancel student loan debt completely?',
    'Is hustle culture toxic or motivational?',
    'Should billionaires exist in a fair society?',
    'Is nuclear energy our climate salvation or dangerous folly?',
    'Should we colonize Mars or fix Earth first?',
    'Is modern dating culture broken beyond repair?',
    'Should we bring back extinct species through de-extinction?',
    'Is free speech absolute or should hate speech be banned?',
    'Should we edit human genes to eliminate diseases?',
    'Is capitalism fundamentally broken?',
    
    // Hot Button Issues
    'Should we eat lab-grown meat or stick to traditional farming?',
    'Is cancel culture necessary accountability or mob rule?',
    'Should we mandate 4-day work weeks by law?',
    'Is privacy dead in the digital age?',
    'Should we tax robots to fund universal basic income?',
    'Is gig economy liberation or exploitation?',
    'Should we ban all fossil fuels by 2030?',
    'Is polyamory the future of relationships?',
    'Should we genetically modify humans for space travel?',
    'Is traditional college education obsolete?'
  ],
  
  writing: [
    // Creative & Emotional
    'Write a breakup letter from humanity to social media',
    'Describe the last human job that will be automated',
    'Write Earth\'s Yelp review from an alien tourist',
    'Explain death to an immortal AI',
    'Write a love letter from a robot to its creator',
    'Describe the color blue to someone born blind',
    'Write the last tweet before the internet shuts down forever',
    'Explain cryptocurrency to your grandmother using only food metaphors',
    'Write a diary entry from the perspective of your smartphone',
    'Describe a sunset to someone who has never seen one',
    
    // Mind-bending Scenarios  
    'Write a restaurant review for a restaurant in space',
    'Explain why humans laugh using only serious academic language',
    'Write instructions for being human to a confused alien',
    'Describe the smell of nostalgia',
    'Write a terms of service agreement for friendship',
    'Explain the internet to someone from the 1800s',
    'Write a cover letter for the job of "being alive"',
    'Describe what anxiety tastes like',
    'Write a eulogy for the concept of privacy',
    'Explain memes to a medieval peasant',
    
    // Philosophical & Deep
    'Write the thoughts of the last book as it\'s being digitized',
    'Describe what it feels like to be forgotten',
    'Write a conversation between Hope and Despair',
    'Explain quantum computing using only emotions',
    'Write the autobiography of the number zero',
    'Describe the weight of a secret',
    'Write a therapy session between Earth and humans',
    'Explain procrastination to someone who never delays anything',
    'Write the last conversation between two humans before AI takes over',
    'Describe what silence sounds like'
  ],
  
  trivia: [
    'Weird historical events that sound fake but are totally real',
    'Science facts that will blow your mind and sound impossible',
    'Pop culture knowledge from the 2000s that hits different now',
    'Geography facts that will make you question what you know',
    'Animal behaviors so bizarre they seem like superpowers',
    'Space facts that make Earth feel insignificant',
    'Technology predictions from the past that aged terribly',
    'Food facts that will ruin your favorite meals',
    'Language quirks and etymology that will surprise you',
    'Human psychology facts that explain why we\'re all weird'
  ],
  
  trading: [
    'Predict the next big tech stock bubble and when it will burst',
    'Which cryptocurrency will be worth the most in 5 years?',
    'Will Tesla stock hit $1000 or $100 first?',
    'Which sector will outperform tech in the next decade?',
    'Predict the next "GameStop" style meme stock explosion',
    'Will Bitcoin replace gold as a store of value?',
    'Which AI company will be the next trillion-dollar giant?',
    'Predict the next major market crash and its trigger',
    'Will real estate crash or continue climbing forever?',
    'Which "dead" company will make the biggest comeback?'
  ]
};

export function getRandomTopic(type = null) {
  if (type && VIRAL_TOPICS[type]) {
    const topics = VIRAL_TOPICS[type];
    return topics[Math.floor(Math.random() * topics.length)];
  }
  
  // Random type and topic
  const types = Object.keys(VIRAL_TOPICS);
  const randomType = types[Math.floor(Math.random() * types.length)];
  const topics = VIRAL_TOPICS[randomType];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  
  return { type: randomType, topic: randomTopic };
}

export function getTopicsByType(type) {
  return VIRAL_TOPICS[type] || [];
}