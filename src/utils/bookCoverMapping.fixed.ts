// Auto-generated book cover mapping (fixed version)
// Generated on: 2025-10-30T12:54:23.408Z
// Total covers: 189

/**
 * Gets the cover image path for a book title
 * @param title The book title to find a cover for
 * @returns The path to the cover image or a default image if not found
 */
export function getBookCover(title: string): string {
  if (!title) return '/placeholder.svg';
  
  // Try to find an exact match
  if (bookCoverMap[title]) {
    return bookCoverMap[title];
  }
  
  // Try case-insensitive match
  const lowerTitle = title.toLowerCase();
  const key = Object.keys(bookCoverMap).find(k => 
    k.toLowerCase() === lowerTitle
  );
  
  if (key) {
    return bookCoverMap[key];
  }
  
  // Try partial match (if title contains or is contained in a key)
  const partialMatch = Object.keys(bookCoverMap).find(k => 
    k.toLowerCase().includes(lowerTitle) || 
    lowerTitle.includes(k.toLowerCase())
  );
  
  if (partialMatch) {
    console.log(`Found partial match for "${title}": using cover for "${partialMatch}"`);
    return bookCoverMap[partialMatch];
  }
  
  // Try matching by removing common words and punctuation
  const simplifiedTitle = lowerTitle
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\b(the|a|an|and|or|but|in|on|at|by|for|with|about)\b/g, '') // Remove common words
    .trim();
  
  if (simplifiedTitle) {
    const simplifiedMatch = Object.keys(bookCoverMap).find(k => {
      const simplifiedKey = k.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\b(the|a|an|and|or|but|in|on|at|by|for|with|about)\b/g, '')
        .trim();
      return simplifiedKey === simplifiedTitle || 
             simplifiedKey.includes(simplifiedTitle) || 
             simplifiedTitle.includes(simplifiedKey);
    });
    
    if (simplifiedMatch) {
      console.log(`Found simplified match for "${title}": using cover for "${simplifiedMatch}"`);
      return bookCoverMap[simplifiedMatch];
    }
  }
  
  // Log missing cover for debugging
  console.warn(`No cover found for book: "${title}"`);
  
  // Return placeholder if no match found
  return '/placeholder.svg';
}

export const bookCoverMap: Record<string, string> = {
  "Henry and Mudge in Puddle Trouble 1987": "/BookCoversNew/Henry and Mudge in puddle trouble.png",
  "Henry and Mudge in the Green Time 1987": "/BookCoversNew/Henry and Mudge in the green time.png",
  "Henry and Mudge Under the Yellow Moon 1987": "/BookCoversNew/Henry and Mudge under the yellow moon.png",
  "Henry and Mudge in the Sparkle Days 1988": "/BookCoversNew/Henry and Mudge in the sparkle days.png",
  "Henry and Mudge and the Forever Sea 1989": "/BookCoversNew/Henry and Mudge and the forever sea.png",
  "Henry and Mudge and the Happy Cat 1990": "/BookCoversNew/Henry and Mudge and the happy cat.png",
  "Ways to Write More Effective Ads": "/BookCoversNew/10 ways to write effective ads.png",
  "100 years of the best American short stories": "/BookCoversNew/100 years of best American stories.png",
  "Henry and Mudge and the Long Weekend 1992": "/BookCoversNew/Henry and Mudge and the long weekend.png",
  "Henry and Mudge and the Wild Wind 1993": "/BookCoversNew/Henry and Mudge and the wild wind.png",
  "Henry and Mudge and the Careful Cousin 1994": "/BookCoversNew/Henry and Mudge and the careful cousin.png",
  "Henry and Mudge and the Starry Night May 1999": "/BookCoversNew/Henry and Mudge and the starry night.png",
  "Henry and Mudge and the Snowman Plan October 2000": "/BookCoversNew/Henry And Mudge And The Snowman Plan.png",
  "Henry and Mudge and the Tall Tree House 2002": "/BookCoversNew/Henry and Mudge and the tall tree house.png",
  "Henry and Mudge and the Wild Goose Chase October 2003": "/BookCoversNew/Henry and Mudge and the wild goose.png",
  "Henry and Mudge and a Very Merry Christmas October 2004": "/BookCoversNew/Henry and Mudge and a very merry christmas.png",
  "Henry and Mudge and the Great Grandpas April 2005": "/BookCoversNew/Henry and Mudge and the great grandpa.png",
  "Henry and Mudge and the Tumbling Trip October 2005": "/BookCoversNew/Henry and Mudge and the tumbling trip.png",
  "Henry and Mudge and the Big Sleepover May 2007": "/BookCoversNew/Henry and Mudge and a big sleepover.png",
  "A Second Chance": "/BookCoversNew/a second chance.jpg",
  "Accidentally in Love  Nikita Singh": "/BookCoversNew/accidentally in love.jpg",
  "Accidental Love   Gary Soto": "/BookCoversNew/Accidental love.png",
  "Adventures of Pinocchio": "/BookCoversNew/The Adventures Of Pinocchio.png",
  "Albert Einstein": "/BookCoversNew/Albert Einstein.jpg",
  "american short stories": "/BookCoversNew/American short stories.jpg",
  "Angels  Demons": "/BookCoversNew/Angels and demons.png",
  "A Half Baked Love Story   Anurag Garg": "/BookCoversNew/a half baked love story.jpg",
  "Bared to You": "/BookCoversNew/bared to you.jpg",
  "Becoming Your Best Self": "/BookCoversNew/Becoming your best self.jpg",
  "Biography of Swami Vivekananda": "/BookCoversNew/Swami vivekananda biography.png",
  "Chetan Bhagat  One Night @ The Call Center": "/BookCoversNew/One Night At Call Center Chetan Bhagat.jpeg",
  "Chicot the Jester": "/BookCoversNew/Chicot the jester.png",
  "CORONAVIRUS Osler": "/BookCoversNew/coronavirus.jpg",
  "dan brown   origin": "/BookCoversNew/Dan Brown Origin.jpg",
  "Drawing Cartoons   Comics for Dummies ( PDF)": "/BookCoversNew/drawing cartoons and comics for dummies.jpg",
  "Durjoy Datta   Of Course I Love You": "/BookCoversNew/Of Course I Love You.jpeg",
  "Durjoy Datta   She Broke Up I Didn t": "/BookCoversNew/She Broke Up. I Didn T.jpg",
  "Durjoy Datta   Till The Last Breath": "/BookCoversNew/Till The Last Breath.jpeg",
  "Durjoy Datta   World s Best Boyfriend": "/BookCoversNew/World S Best Boyfriend Durjoy Datta.jpeg",
  "Durjoy Datta   You Were My Crush": "/BookCoversNew/You Were My Crush Till You Said Durjoy Datta.jpeg",
  "Durjoy Dutta   Our IMPossible Love": "/BookCoversNew/our impossible love.jpg",
  "Durjoy Dutta   Someone Like You": "/BookCoversNew/Someone Like You.jpeg",
  "eleven minutes": "/BookCoversNew/Eleven minutes.png",
  "elmers special day by david mckee": "/BookCoversNew/elmers special day.jpg",
  "fables and stories": "/BookCoversNew/fables and stories.jpg",
  "Few Things Left Unsaid  Sudeep Nagarkar": "/BookCoversNew/few things left unsaid.jpg",
  "First We Make the Beast Beautiful   Sarah Wilson  233": "/BookCoversNew/First We Make The Beast Beautiful.jpg",
  "Gone Girl": "/BookCoversNew/Gone Girl.jpg",
  "Grandma s Bag of Stories By Sudha Murty": "/BookCoversNew/Grandma S Bag Of Stories.jpg",
  "harry potter 2 chamber of secrets": "/BookCoversNew/Harry Potter And The Chamber Of Secrets.jpg",
  "harry potter 3 prisoner of azkaban": "/BookCoversNew/Harry Potter and the prisoner of azkaban.jpg",
  "harry potter 4 goblet of fire": "/BookCoversNew/Harry Potter and the goblet of fire.jpg",
  "harry potter 6 half blood prince": "/BookCoversNew/Harry Potter and the half blood prince.jpg",
  "harry potter 7 deathly hallows": "/BookCoversNew/Harry Potter and the deathly hallows.jpg",
  "healing the child within  148": "/BookCoversNew/Healing the child within.png",
  "Healing Depression": "/BookCoversNew/healing depression the mind body way.jpg",
  "How to Become a Straight A Student": "/BookCoversNew/How To Become A Straight A Student.jpg",
  "How to Win Every Argument ( PDF)": "/BookCoversNew/How To Win Every Argument.jpg",
  "I Too had a Love Story by Ravinder Singh": "/BookCoversNew/I Too Had A Love Story.jpg",
  "I Too Had A Love Story pdf Ravinder Singh": "/BookCoversNew/I Too Had A Love Story.jpg",
  "India that is Bharat by J Sai Deepak": "/BookCoversNew/India That Is Bharat.jpg",
  "It Happens for a Reason   Preeti Shenoy": "/BookCoversNew/It happens for a reason.jpg",
  "It Started with a Friend Request  Sudeep Nagarkar": "/BookCoversNew/It Started With A Friend Request.jpg",
  "It s Not How Good You Are, It s How Good You Want to Be 132": "/BookCoversNew/It S Not How Good You Are, It S How Good You Want To Be.jpg",
  "It Happens for A Reason by Preeti Shenoy": "/BookCoversNew/It happens for a reason.jpg",
  "It Started with a Friend Reques": "/BookCoversNew/It Started With A Friend Request.jpg",
  "J. R. R. Tolkien   Adventures of Tom Bombadil (1978)": "/BookCoversNew/The adventures of Tom bombadil.png",
  "Learn Russian with Beginner Stories Interlinear Russian to Engli": "/BookCoversNew/Learn Russian with beginner stories.png",
  "Life Is What You Make It by Preeti Shenoy": "/BookCoversNew/life is what you make it.jpg",
  "Like It Happened Yesterday": "/BookCoversNew/Like It Happened Yesterday.jpg",
  "Love  Kisses And All Things Warm by Preeti Shenoy": "/BookCoversNew/Love Kisses And All Things Warm.jpeg",
  "Lynn Grabhorn Dear God, What s Happening to Us Halting Eons of M": "/BookCoversNew/Lynn Grabhorn Dear God What S Happening To Us.jpeg",
  "Mahayoddha Kalki  Sword of Shiva by Kevin Missal": "/BookCoversNew/Mahayoddha Kalki Sword Of Shiva.jpeg",
  "Mark Twain   The adventures of Tom Sawyer": "/BookCoversNew/Mark Twain The adventures of Tom Swain.jpeg",
  "Mel Robbins The 5 Second Rule Transform your Life, Work, and Con": "/BookCoversNew/The 5 Second Rule Transform Your Life.jpeg",
  "Michael Jordan A Biography": "/BookCoversNew/Michael Jordan A Biography.jpeg",
  "Midnights children by Salman Rushdie ()": "/BookCoversNew/Midnights Children By Salman Rushdie.jpeg",
  "Mistakes Like Love and Sex   Madhuri Banerjee": "/BookCoversNew/Mistakes Like Love And Sex.jpeg",
  "Modern Arabic Short Stories  A Bilingual Reader": "/BookCoversNew/Modern Arabic Short Stories.jpeg",
  "Mother Teresa   A Biography": "/BookCoversNew/Mother Teresa A Biography.jpeg",
  "MY CLINGY GIRLFRIEND   MADHURI BANERJEE": "/BookCoversNew/My Clingy Girlfriend Madhuri.jpeg",
  "mystery short stories": "/BookCoversNew/Mystery Short Stories.jpeg",
  "Narendra Modi A Political Biography": "/BookCoversNew/Narendra Modi A Political Biography.jpeg",
  "Nelson Mandela A Biography": "/BookCoversNew/Nelson Mandela A Biography.jpeg",
  "Of Course I Love You": "/BookCoversNew/of course I love you.jpg",
  "Of Course I Love You!  Till I f": "/BookCoversNew/Of Course I Love You Till I Found Someone Better.jpeg",
  "Ohh Yes  I m Single  And so is Datta ": "/BookCoversNew/Ohh Yes I M Single And So Is D.jpeg",
  "Oliver Twist": "/BookCoversNew/Oliver Twist.jpeg",
  "One Arranged Murder by Chetan Bhagat": "/BookCoversNew/One Arranged Murder.jpeg",
  "One Night at call center by Chetan Bhagat": "/BookCoversNew/One night at the call center.png",
  "One Indian Girl": "/BookCoversNew/One Indian Girl Chetan Bhagat.jpeg",
  "One Indian Girl   Chetan Bhagat": "/BookCoversNew/One Indian Girl Chetan Bhagat.jpeg",
  "Osho, Osho International Foundation Life is a soap bubble 100 wa": "/BookCoversNew/Osho Osho International Foundation.jpeg",
  "Our Story Needs No Filter   Sudeep Nagarkar": "/BookCoversNew/Our Story Needs No Filter Sudeep.jpeg",
  "Outsiders. American Short Stories for students of ESL": "/BookCoversNew/Outsiders American Short Stories for students of esl.jpeg",
  "Percy Jackson and The Last Olympian": "/BookCoversNew/Percy Jackson And The Last Olympian.jpeg",
  "Percy Jackson and The Lightning Thief": "/BookCoversNew/Percy Jackson And The Lightning Thief.jpeg",
  "Percy Jackson and The Sea of Monsters": "/BookCoversNew/Percy Jackson And The Sea Of Monsters.jpeg",
  "Percy Jackson and The Titan s Curse": "/BookCoversNew/Percy Jackson And The Titan S Curse.jpeg",
  "Picture Dictionary, Longman Childrens Picture Dictionary by Pear": "/BookCoversNew/Picture Dictionary Longman Children.jpeg",
  "pingpdf.com the girl of my dreams infocopain": "/BookCoversNew/pingpdf.com The girl of my dreams.jpeg",
  "Prem Purana  Mythological Love Stories": "/BookCoversNew/Prem Purana Mythological Love Stories.jpeg",
  "Reasons to Stay Alive by Matt Haig  158": "/BookCoversNew/Reasons To Stay Alive Matt Haig.jpeg",
  "Rebecca": "/BookCoversNew/Rebecca.jpeg",
  "Reflections Of A Man   Amari Soul": "/BookCoversNew/Reflections Of A Man Amari Soul.jpeg",
  "Religious Therapeutics Body": "/BookCoversNew/Religious Therapeutics Body.jpeg",
  "revolution 2020 by chetan bhagat": "/BookCoversNew/Revolution 2020 Chetan Bhagat.jpeg",
  "Rich Dads Increase Your Financial IQ Get Smarter with Your Money": "/BookCoversNew/Rich Dads Increase Your Financial IQ.jpeg",
  "Right Here Right Now   NIKITA SINGH NOVEL": "/BookCoversNew/Right Here Right Now Nikita Singh.jpeg",
  "Robinson Crusoe": "/BookCoversNew/Robinson Crusoe.jpeg",
  "Robin S Sharma The Monk Who Sold His Ferrari A Fable About Fulfi": "/BookCoversNew/The Monk Who Sold His Ferrari Robin S Sharma.jpeg",
  "Ruk Jaana Nahin   Nishant Jain": "/BookCoversNew/Ruk Jaana Nahin Nishant Jain.jpeg",
  "Sacred Games  A Novel": "/BookCoversNew/Sacred Games A Novel.jpeg",
  "Satyayoddha Kalki  Eye of Brahma by Kevin Missal": "/BookCoversNew/Satyayoddha Kalki Eye Of Brahma.jpeg",
  "Selected Short Stories": "/BookCoversNew/Selected Short Stories.jpeg",
  "She Broke Up  I Didn t  I Just Durjoy": "/BookCoversNew/She Broke Up I Didn T I Just Kissed.jpeg",
  "short stories english": "/BookCoversNew/Short Stories English.jpeg",
  "Short Stories for Children for Spoken English": "/BookCoversNew/Short Stories For Children For Spoken English Practice.jpeg",
  "short stories for english courses": "/BookCoversNew/Short Stories For English Courses.jpeg",
  "SHORT STORIES": "/BookCoversNew/SHORT STORIES.jpeg",
  "Short stories from 100 Selected Stories 2": "/BookCoversNew/100 Selected Short Stories.jpeg",
  "Short Stories": "/BookCoversNew/English through short stories and jokes.png",
  "Shutter Island": "/BookCoversNew/Shutter Island.jpeg",
  "small size drawing the human body": "/BookCoversNew/Small Size Drawing The Human Body.jpeg",
  "Soma in Yoga and Ayurveda": "/BookCoversNew/Soma in Yoga and Ayurveda.jpeg",
  "Someone Like You": "/BookCoversNew/Someone Like You.jpg",
  "Someone Like You Durjoy  Datta i": "/BookCoversNew/Someone Like You Durjoy Datta.jpeg",
  "Sorry, You are not my Type by Sudeep Nagarkar": "/BookCoversNew/Sorry, You Are Not My Type By Sudeep.jpeg",
  "Spanish Short Stories For Beginners": "/BookCoversNew/Spanish Short Stories For Beginners.jpeg",
  "Stephen W Hawking The theory of everything 2006, Phoenix Books l": "/BookCoversNew/Stephen W Hawking The Theory Of Everything.jpeg",
  "stories  198": "/BookCoversNew/Stories 198.jpeg",
  "STORIES": "/BookCoversNew/stories.jpeg",
  "Super Immunity The Essential Nutrition Guide for Boosting Your B": "/BookCoversNew/Super Immunity The Essential Nutrition.jpeg",
  "Sweet nothings": "/BookCoversNew/Sweet Nothings.jpeg",
  "sweet sixteen": "/BookCoversNew/Sweet Sixteen.jpeg",
  "Ten Years Later": "/BookCoversNew/Ten Years Later.jpeg",
  "Textbook of Ayurveda": "/BookCoversNew/Textbook of Ayurveda.jpeg",
  "The 3 (Three) Mistakes of My Life by Chetan Bhagat (z)": "/BookCoversNew/Th 3 (Three) Mistakes Of My Life Chetan Bhagat.jpeg",
  "The Bhagavad Gita A Biography": "/BookCoversNew/The Bhagavad Gita A Biography.jpeg",
  "The Boy in The Striped Pajamas   D. Boyne": "/BookCoversNew/The Boy In The Striped Pajamas.jpeg",
  "The Call of the Wild": "/BookCoversNew/The Call Of The Wild.jpeg",
  "The Complete Short Stories": "/BookCoversNew/The Complete Short Stories.jpeg",
  "The DaVinci Code by Dan Brown": "/BookCoversNew/The Davinci Code Dan Brown.jpeg",
  "The Day of the Jackal": "/BookCoversNew/The Day Of The Jackal.jpeg",
  "The Extraordinary Miss Sunshine": "/BookCoversNew/The Extraordinary Miss Sunshine.jpeg",
  "The Forty Five Guardsmen": "/BookCoversNew/The Forty Five Guardsmen.jpeg",
  "The House That BJ Built": "/BookCoversNew/The House That BJ Built.jpeg",
  "The Jungle Book": "/BookCoversNew/The Jungle Book Nt.jpeg",
  "The Little Mermaid": "/BookCoversNew/The Little Mermaid.jpeg",
  "The Lost Symbol": "/BookCoversNew/The Lost Symbol.jpeg",
  "The Palace of Illusions": "/BookCoversNew/The Palace Of Illusions.jpeg",
  "The Paradoxical Prime Minister by Shashi Tharoor (z)": "/BookCoversNew/The Paradoxical Prime Minister.jpeg",
  "The Promise by Nikita Singh indianauthornovels.blogspot.in": "/BookCoversNew/The Promise Nikita Singh.jpeg",
  "The Zoya Factor": "/BookCoversNew/The Zoya Factor.jpeg",
  "The 5 Second Rule Transform your Life, Work, and Confidence with": "/BookCoversNew/The 5 Second Rule Transform Your Life.jpeg",
  "The Anxiety and Phobia Workbook  614": "/BookCoversNew/The Anxiety And Phobia Workbook.jpeg",
  "The Boy with a Broken Heart   Durjoy Datta": "/BookCoversNew/The Boy With A Broken Heart.jpeg",
  "The Girl I Last Loved   Smita Kaushik": "/BookCoversNew/The Girl I Last Loved Smita Kau.jpeg",
  "The Happiness Trap  292": "/BookCoversNew/The Happiness Trap.jpeg",
  "The Jungle Book NT": "/BookCoversNew/The Jungle Book Rudyard Kipling.jpeg",
  "The Lord of the Rings  , 2 J R R Tolkien Lord of the Rings, Part": "/BookCoversNew/The Lord Of The Rings 2.jpeg",
  "The Lord of The Rings  , 3 J R R Tolkien Lord of The Rings, Part": "/BookCoversNew/The Lord Of The Rings 3.jpeg",
  "The Man Who Saved India Sardar Patel and His Idea of India by Hi": "/BookCoversNew/The Man Who Saved India SARDAR PATEL.jpeg",
  "The Merry Adventures of Robin Hood NT": "/BookCoversNew/The Merry Adventures Of Robin Hood.jpeg",
  "the mother i never knew Sudha Murthy": "/BookCoversNew/The Mother I Never Knew.jpeg",
  "The One You Cannot Have by Preeti Shenoy": "/BookCoversNew/The One You Cannot Have.jpeg",
  "The Pilgrimage": "/BookCoversNew/The Pilgrimage.jpeg",
  "The Science of Self Healing": "/BookCoversNew/The Science Of Self Healing.jpeg",
  "The Secret Wishlist by Preeti shenoy": "/BookCoversNew/The Secret Wishlist Preeti Shenoy.jpeg",
  "Three mistakes of my life  Chetan Bhagat": "/BookCoversNew/Three Mistakes Of My Life Chetan Bhagat.jpeg",
  "Three Mistakes of My Life": "/BookCoversNew/The Mistakes Of My Life.jpeg",
  "Three Ghost Stories NT": "/BookCoversNew/Three Ghost Stories.jpeg",
  "Till the Last Breath Durjoy Datt": "/BookCoversNew/Till The last breath.png",
  "Trade and Grow Rich": "/BookCoversNew/Trade And Grow Rich.jpeg",
  "Trading Price Action Trading Ranges Technical Analysis of Price": "/BookCoversNew/Trading Price Action Trading Ranges.jpeg",
  "Undergraduate topics in computer science Antti Laaksonen Guide t": "/BookCoversNew/Undergraduate Topics In Computer Science.jpeg",
  "Veronika Decides to Die   Paulo Coelho": "/BookCoversNew/Veronika Decides To Die.jpeg",
  "Vicomte de Bragelonne": "/BookCoversNew/Vicomte De Bragelonne.jpeg",
  "Wabi Sabi Japanese Wisdom for a Perfectly Imperfect Life Beth Ke": "/BookCoversNew/Wabi Sabi Japanese Wisdom For A Perfectly Imperfect Life.jpeg",
  "when dimple met rishi": "/BookCoversNew/When Dimple Met Rishi.jpeg",
  "When Only Love Remains   Durjoy Datta": "/BookCoversNew/When Only Love Remains -Durjoy Datta .jpeg",
  "When Only Love Remains Durjoy Da": "/BookCoversNew/When ONly Love Remains Durjoy Datta.jpeg",
  "Wilde Oscar Short Stories": "/BookCoversNew/Wilde Oscar Short Stories.jpeg",
  "Will You Still Love Me By Ravinder Singh": "/BookCoversNew/Will You Still Love Me Ravindra Singh.jpeg",
  "Wonder": "/BookCoversNew/Wonder.jpeg",
  "World s Best Boyfriend Durjoy Da": "/BookCoversNew/World S Best Boyfriend.jpg",
  "you are trending in my dreams novel": "/BookCoversNew/You Are Trending In My Dreams Now.jpeg",
  "Your Dreams Are Mine Now Novel Ravinder Singh in pdf": "/BookCoversNew/Your Dreams Are Mine Now Novel.jpeg",
  "अकबर और बरबल": "/BookCoversNew/दो बैलों की कथा.png"
};
