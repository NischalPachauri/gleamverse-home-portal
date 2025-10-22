export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  pdfPath: string;
  year: number;
  pages: string;
  genre: string;
}

export const books: Book[] = [
  // Harry Potter Series - Always first 8 books
  {
    id: "hp1",
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    description: "The first adventure begins as Harry discovers he's a wizard and enters the magical world of Hogwarts School of Witchcraft and Wizardry.",
    coverImage: "hp1",
    pdfPath: "/books/harry-potter-1-philosophers-stone.pdf",
    year: 1997,
    pages: "309",
    genre: "Fantasy"
  },
  {
    id: "hp2",
    title: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling",
    description: "Harry's second year at Hogwarts is filled with mystery as the Chamber of Secrets is opened and students are being petrified.",
    coverImage: "hp2",
    pdfPath: "/books/harry-potter-2-chamber-of-secrets.pdf",
    year: 1998,
    pages: "341",
    genre: "Fantasy"
  },
  {
    id: "hp3",
    title: "Harry Potter and the Prisoner of Azkaban",
    author: "J.K. Rowling",
    description: "Harry learns about his past and faces the escaped prisoner Sirius Black while discovering new magical abilities.",
    coverImage: "hp3",
    pdfPath: "/books/harry-potter-3-prisoner-of-azkaban.pdf",
    year: 1999,
    pages: "435",
    genre: "Fantasy"
  },
  {
    id: "hp4",
    title: "Harry Potter and the Goblet of Fire",
    author: "J.K. Rowling",
    description: "Harry competes in the dangerous Triwizard Tournament and witnesses the return of Lord Voldemort.",
    coverImage: "hp4",
    pdfPath: "/books/harry-potter-4-goblet-of-fire.pdf",
    year: 2000,
    pages: "636",
    genre: "Fantasy"
  },
  {
    id: "hp5",
    title: "Harry Potter and the Order of the Phoenix",
    author: "J.K. Rowling",
    description: "Harry forms Dumbledore's Army and fights against the Ministry's denial of Voldemort's return.",
    coverImage: "hp5",
    pdfPath: "/books/harry-potter-5-order-of-phoenix.pdf",
    year: 2003,
    pages: "870",
    genre: "Fantasy"
  },
  {
    id: "hp6",
    title: "Harry Potter and the Half-Blood Prince",
    author: "J.K. Rowling",
    description: "Harry learns about Voldemort's past through Dumbledore's memories and discovers the Half-Blood Prince's secrets.",
    coverImage: "hp6",
    pdfPath: "/books/harry-potter-6-half-blood-prince.pdf",
    year: 2005,
    pages: "607",
    genre: "Fantasy"
  },
  {
    id: "hp7",
    title: "Harry Potter and the Deathly Hallows",
    author: "J.K. Rowling",
    description: "The epic conclusion as Harry, Ron, and Hermione hunt for Horcruxes and face the final battle against Voldemort.",
    coverImage: "hp7",
    pdfPath: "/books/harry-potter-7-deathly-hallows.pdf",
    year: 2007,
    pages: "607",
    genre: "Fantasy"
  },
  {
    id: "hp8",
    title: "Harry Potter and the Cursed Child",
    author: "J.K. Rowling, Jack Thorne, John Tiffany",
    description: "The next generation story follows Harry's son Albus as he struggles with his family legacy at Hogwarts.",
    coverImage: "hp8",
    pdfPath: "/books/harry-potter-8-cursed-child.pdf",
    year: 2016,
    pages: "343",
    genre: "Fantasy"
  },

  // Romance/Contemporary Fiction
  {
    id: "half-girlfriend",
    title: "Half Girlfriend",
    author: "Chetan Bhagat",
    description: "A beautiful tale of love between a rural boy and an urban girl, exploring the complexities of relationships.",
    coverImage: "placeholder",
    pdfPath: "/books/Half Girlfriend by Chetan Bhagat.pdf",
    year: 2014,
    pages: "280",
    genre: "Romance"
  },
  {
    id: "2-states",
    title: "2 States: The Story of My Marriage",
    author: "Chetan Bhagat",
    description: "A love story about a couple from two different Indian states who want to get married.",
    coverImage: "placeholder",
    pdfPath: "/books/2-states-the-story-of-my-marriage-by-chetan-bhagat.pdf",
    year: 2009,
    pages: "269",
    genre: "Romance"
  },
  {
    id: "revolution-2020",
    title: "Revolution 2020",
    author: "Chetan Bhagat",
    description: "A story of love, corruption, and ambition set in the Indian education system.",
    coverImage: "placeholder",
    pdfPath: "/books/revolution-2020-by-chetan-bhagat.pdf",
    year: 2011,
    pages: "286",
    genre: "Romance"
  },
  {
    id: "one-indian-girl",
    title: "One Indian Girl",
    author: "Chetan Bhagat",
    description: "The story of an independent, financially secure Indian girl and her journey to find love.",
    coverImage: "placeholder",
    pdfPath: "/books/One-Indian-Girl.pdf",
    year: 2016,
    pages: "280",
    genre: "Romance"
  },
  {
    id: "of-course-i-love-you",
    title: "Of Course I Love You",
    author: "Durjoy Datta",
    description: "A romantic tale about finding true love in unexpected places.",
    coverImage: "placeholder",
    pdfPath: "/books/Of-Course-I-Love-You.pdf",
    year: 2010,
    pages: "240",
    genre: "Romance"
  },
  {
    id: "till-last-breath",
    title: "Till The Last Breath",
    author: "Durjoy Datta",
    description: "A touching story about love, loss, and living life to the fullest.",
    coverImage: "placeholder",
    pdfPath: "/books/Durjoy Datta - Till The Last Breath.pdf",
    year: 2012,
    pages: "256",
    genre: "Romance"
  },
  {
    id: "worlds-best-boyfriend",
    title: "World's Best Boyfriend",
    author: "Durjoy Datta",
    description: "A heartwarming story about second chances and finding your soulmate.",
    coverImage: "placeholder",
    pdfPath: "/books/Durjoy Datta - World s Best Boyfriend.pdf",
    year: 2013,
    pages: "248",
    genre: "Romance"
  },
  {
    id: "someone-like-you",
    title: "Someone Like You",
    author: "Durjoy Datta",
    description: "An emotional journey about love, friendship, and finding yourself.",
    coverImage: "placeholder",
    pdfPath: "/books/Someone-Like-You.pdf",
    year: 2013,
    pages: "260",
    genre: "Romance"
  },

  // Biography
  {
    id: "wings-of-fire",
    title: "Wings of Fire: An Autobiography",
    author: "APJ Abdul Kalam",
    description: "The inspiring autobiography of India's Missile Man and former President.",
    coverImage: "placeholder",
    pdfPath: "/books/Wings of Fire_ An Autobiography of APJ Abdul Kalam.pdf",
    year: 1999,
    pages: "196",
    genre: "Biography"
  },
  {
    id: "long-walk-to-freedom",
    title: "Long Walk to Freedom",
    author: "Nelson Mandela",
    description: "The autobiography of one of the greatest moral and political leaders of our time.",
    coverImage: "placeholder",
    pdfPath: "/books/Long_Walk_to_Freedom_The_Autobiography_of_Nelson_Mandela_by_Nels.pdf",
    year: 1994,
    pages: "656",
    genre: "Biography"
  },
  {
    id: "albert-einstein",
    title: "Albert Einstein: A Biography",
    author: "Various",
    description: "The life story of the brilliant physicist who changed our understanding of the universe.",
    coverImage: "placeholder",
    pdfPath: "/books/Albert Einstein.pdf",
    year: 2007,
    pages: "320",
    genre: "Biography"
  },
  {
    id: "steve-jobs",
    title: "Steve Jobs: Presentation Secrets",
    author: "Carmine Gallo",
    description: "Learn the presentation techniques that made Steve Jobs one of the most captivating speakers.",
    coverImage: "placeholder",
    pdfPath: "/books/Presentation Secrets Of Steve Jobs.pdf",
    year: 2010,
    pages: "256",
    genre: "Biography"
  },
  {
    id: "narendra-modi",
    title: "Narendra Modi: A Political Biography",
    author: "Various",
    description: "The political journey of India's dynamic Prime Minister.",
    coverImage: "placeholder",
    pdfPath: "/books/Narendra Modi A Political Biography.pdf",
    year: 2014,
    pages: "320",
    genre: "Biography"
  },
  {
    id: "mother-teresa",
    title: "Mother Teresa: A Biography",
    author: "Various",
    description: "The life of the selfless nun who dedicated her life to serving the poorest of the poor.",
    coverImage: "placeholder",
    pdfPath: "/books/Mother Teresa - A Biography.pdf",
    year: 2003,
    pages: "240",
    genre: "Biography"
  },

  // Classic Literature
  {
    id: "crime-punishment",
    title: "Crime and Punishment",
    author: "Fyodor Dostoyevsky",
    description: "A psychological thriller about guilt, redemption, and the human condition.",
    coverImage: "placeholder",
    pdfPath: "/books/Crime and Punishment -  Fyodor Dostoyevsky.pdf",
    year: 1866,
    pages: "671",
    genre: "Fiction"
  },
  {
    id: "count-monte-cristo",
    title: "The Count of Monte Cristo",
    author: "Alexandre Dumas",
    description: "An epic tale of wrongful imprisonment, escape, and revenge.",
    coverImage: "placeholder",
    pdfPath: "/books/The Count Of MonteCristo.pdf",
    year: 1844,
    pages: "1276",
    genre: "Fiction"
  },
  {
    id: "three-musketeers",
    title: "The Three Musketeers",
    author: "Alexandre Dumas",
    description: "A swashbuckling adventure of friendship, honor, and loyalty.",
    coverImage: "placeholder",
    pdfPath: "/books/The Three Musketeers.pdf",
    year: 1844,
    pages: "700",
    genre: "Fiction"
  },
  {
    id: "frankenstein",
    title: "Frankenstein",
    author: "Mary Shelley",
    description: "The classic tale of a scientist who creates a living being with disastrous consequences.",
    coverImage: "placeholder",
    pdfPath: "/books/Frankenstein_NT.pdf",
    year: 1818,
    pages: "280",
    genre: "Fiction"
  },
  {
    id: "rebecca",
    title: "Rebecca",
    author: "Daphne du Maurier",
    description: "A haunting tale of jealousy, mystery, and obsession.",
    coverImage: "placeholder",
    pdfPath: "/books/Rebecca.pdf",
    year: 1938,
    pages: "449",
    genre: "Fiction"
  },

  // Mystery/Thriller
  {
    id: "davinci-code",
    title: "The Da Vinci Code",
    author: "Dan Brown",
    description: "A gripping thriller about secret societies, ancient mysteries, and religious conspiracies.",
    coverImage: "placeholder",
    pdfPath: "/books/The DaVinci Code by Dan Brown.pdf",
    year: 2003,
    pages: "454",
    genre: "Mystery"
  },
  {
    id: "angels-demons",
    title: "Angels & Demons",
    author: "Dan Brown",
    description: "A race against time to prevent a powerful weapon from destroying Vatican City.",
    coverImage: "placeholder",
    pdfPath: "/books/Angels  Demons.pdf",
    year: 2000,
    pages: "616",
    genre: "Mystery"
  },
  {
    id: "inferno",
    title: "Inferno",
    author: "Dan Brown",
    description: "Robert Langdon races through Italy following clues related to Dante's Inferno.",
    coverImage: "placeholder",
    pdfPath: "/books/Inferno-by-BrownDan.pdf",
    year: 2013,
    pages: "461",
    genre: "Mystery"
  },
  {
    id: "gone-girl",
    title: "Gone Girl",
    author: "Gillian Flynn",
    description: "A psychological thriller about a marriage gone terribly wrong.",
    coverImage: "placeholder",
    pdfPath: "/books/Gone Girl.pdf",
    year: 2012,
    pages: "419",
    genre: "Mystery"
  },
  {
    id: "silent-patient",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    description: "A woman shoots her husband and then never speaks again. A psychotherapist becomes obsessed with uncovering the truth.",
    coverImage: "placeholder",
    pdfPath: "/books/The Silent Patient by Alex Michaelides.pdf",
    year: 2019,
    pages: "336",
    genre: "Mystery"
  },
  {
    id: "shutter-island",
    title: "Shutter Island",
    author: "Dennis Lehane",
    description: "A US Marshal investigates the disappearance of a patient from a hospital for the criminally insane.",
    coverImage: "placeholder",
    pdfPath: "/books/Shutter Island.pdf",
    year: 2003,
    pages: "380",
    genre: "Mystery"
  },

  // Philosophy/Spiritual
  {
    id: "alchemist",
    title: "The Alchemist",
    author: "Paulo Coelho",
    description: "A magical tale about following your dreams and listening to your heart.",
    coverImage: "placeholder",
    pdfPath: "/books/The Alchemist by Paulo Coelho.pdf",
    year: 1988,
    pages: "197",
    genre: "Philosophy"
  },
  {
    id: "bhagavad-gita",
    title: "Bhagavad Gita",
    author: "Vyasa",
    description: "Ancient Hindu scripture on philosophy, spirituality, and the path to enlightenment.",
    coverImage: "placeholder",
    pdfPath: "/books/Bhagavad-Gita (Hindi)).pdf",
    year: -400,
    pages: "700",
    genre: "Philosophy"
  },
  {
    id: "the-secret",
    title: "The Secret",
    author: "Rhonda Byrne",
    description: "Discover the law of attraction and how to use it to achieve your goals.",
    coverImage: "placeholder",
    pdfPath: "/books/The-Secret-by-Rhonda-Byrne.pdf",
    year: 2006,
    pages: "198",
    genre: "Philosophy"
  },
  {
    id: "eleven-minutes",
    title: "Eleven Minutes",
    author: "Paulo Coelho",
    description: "A poignant exploration of love, sex, and spirituality.",
    coverImage: "placeholder",
    pdfPath: "/books/eleven_minutes.pdf",
    year: 2003,
    pages: "288",
    genre: "Philosophy"
  },

  // Indian Literature
  {
    id: "sacred-games",
    title: "Sacred Games",
    author: "Vikram Chandra",
    description: "An epic crime thriller set in the underworld of Mumbai.",
    coverImage: "placeholder",
    pdfPath: "/books/Sacred Games_ A Novel.pdf",
    year: 2006,
    pages: "916",
    genre: "Fiction"
  },
  {
    id: "palace-of-illusions",
    title: "The Palace of Illusions",
    author: "Chitra Banerjee Divakaruni",
    description: "The Mahabharata retold from Draupadi's perspective.",
    coverImage: "placeholder",
    pdfPath: "/books/The Palace of Illusions.pdf",
    year: 2008,
    pages: "360",
    genre: "Fiction"
  },
  {
    id: "scion-ikshvaku",
    title: "Scion of Ikshvaku",
    author: "Amish Tripathi",
    description: "The story of Lord Ram, reimagined in this epic tale.",
    coverImage: "placeholder",
    pdfPath: "/books/Scion of Ikshvaku (Ram Chandra - Amish Tripathi.pdf",
    year: 2015,
    pages: "421",
    genre: "Fiction"
  },
  {
    id: "india-that-is-bharat",
    title: "India That Is Bharat",
    author: "J Sai Deepak",
    description: "An examination of India's civilizational identity and colonial influences.",
    coverImage: "placeholder",
    pdfPath: "/books/India that is Bharat by J Sai Deepak.pdf",
    year: 2021,
    pages: "560",
    genre: "Non-Fiction"
  },

  // Children's/Young Adult
  {
    id: "percy-jackson-1",
    title: "Percy Jackson and The Lightning Thief",
    author: "Rick Riordan",
    description: "A young boy discovers he's the son of a Greek god and must prevent a war among the gods.",
    coverImage: "placeholder",
    pdfPath: "/books/Percy Jackson and The Lightning Thief.pdf",
    year: 2005,
    pages: "377",
    genre: "Children's"
  },
  {
    id: "jungle-book",
    title: "The Jungle Book",
    author: "Rudyard Kipling",
    description: "The classic tale of Mowgli, a boy raised by wolves in the Indian jungle.",
    coverImage: "placeholder",
    pdfPath: "/books/The_Jungle_Book_NT.pdf",
    year: 1894,
    pages: "277",
    genre: "Children's"
  },
  {
    id: "grandmas-bag",
    title: "Grandma's Bag of Stories",
    author: "Sudha Murty",
    description: "A collection of wonderful stories told by a grandmother to her grandchildren.",
    coverImage: "placeholder",
    pdfPath: "/books/Grandma s_Bag_of_Stories_By_Sudha_Murty.pdf",
    year: 2015,
    pages: "200",
    genre: "Children's"
  },
  {
    id: "boy-striped-pajamas",
    title: "The Boy in The Striped Pajamas",
    author: "John Boyne",
    description: "A powerful story of friendship during the Holocaust.",
    coverImage: "placeholder",
    pdfPath: "/books/The Boy in The Striped Pajamas - D. Boyne.pdf",
    year: 2006,
    pages: "216",
    genre: "Children's"
  },

  // Self-Help/Wellness
  {
    id: "life-is-what-you-make-it",
    title: "Life Is What You Make It",
    author: "Preeti Shenoy",
    description: "An inspiring story about mental health, resilience, and finding happiness.",
    coverImage: "placeholder",
    pdfPath: "/books/Life_Is_What_You_Make_It_by_Preeti_Shenoy.pdf",
    year: 2011,
    pages: "234",
    genre: "Non-Fiction"
  },
  {
    id: "it-happens-for-reason",
    title: "It Happens for a Reason",
    author: "Preeti Shenoy",
    description: "A touching story about difficult choices and finding your path.",
    coverImage: "placeholder",
    pdfPath: "/books/It Happens for a Reason - Preeti Shenoy.pdf",
    year: 2013,
    pages: "264",
    genre: "Non-Fiction"
  },

  // Additional Fiction
  {
    id: "five-point-someone",
    title: "Five Point Someone",
    author: "Chetan Bhagat",
    description: "The story of three friends and their struggles in India's top engineering college.",
    coverImage: "placeholder",
    pdfPath: "/books/five-point-someone-chetan-bhagat_ebook.pdf",
    year: 2004,
    pages: "267",
    genre: "Fiction"
  },
  {
    id: "call-center",
    title: "One Night @ The Call Center",
    author: "Chetan Bhagat",
    description: "Six people working at a call center experience a life-changing night.",
    coverImage: "placeholder",
    pdfPath: "/books/Chetan Bhagat- One Night @ The Call Center.pdf",
    year: 2005,
    pages: "271",
    genre: "Fiction"
  },
  {
    id: "three-mistakes",
    title: "The 3 Mistakes of My Life",
    author: "Chetan Bhagat",
    description: "A story of friendship, dreams, and the mistakes that change everything.",
    coverImage: "placeholder",
    pdfPath: "/books/Three mistakes of my life- Chetan Bhagat.pdf",
    year: 2008,
    pages: "254",
    genre: "Fiction"
  },
  {
    id: "girl-room-105",
    title: "The Girl in Room 105",
    author: "Chetan Bhagat",
    description: "A thrilling mystery about love, obsession, and murder.",
    coverImage: "placeholder",
    pdfPath: "/books/The Girl in Room 105 by Chetan Bhagat.pdf",
    year: 2018,
    pages: "280",
    genre: "Mystery"
  },
  {
    id: "i-too-had-love-story",
    title: "I Too Had A Love Story",
    author: "Ravinder Singh",
    description: "A heart-wrenching true love story that will leave you in tears.",
    coverImage: "placeholder",
    pdfPath: "/books/I Too Had A Love Story-pdf-Ravinder Singh.pdf",
    year: 2008,
    pages: "192",
    genre: "Romance"
  },
  {
    id: "hotel",
    title: "Hotel",
    author: "Arthur Hailey",
    description: "A gripping drama set in a luxury hotel over five eventful days.",
    coverImage: "placeholder",
    pdfPath: "/books/Hotel by Arthur Hailey.pdf",
    year: 1965,
    pages: "440",
    genre: "Fiction"
  },
  {
    id: "one-hundred-years",
    title: "One Hundred Years of Solitude",
    author: "Gabriel García Márquez",
    description: "A magical realist masterpiece chronicling the Buendía family.",
    coverImage: "placeholder",
    pdfPath: "/books/one-hundred-years-of-solitude.pdf",
    year: 1967,
    pages: "417",
    genre: "Fiction"
  }
];
