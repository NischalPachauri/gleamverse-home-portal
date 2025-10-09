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
  }
];
