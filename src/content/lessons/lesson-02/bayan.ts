import type { BayanContent, Line } from "@/features/bayan/content";

const say = (speaker: string, text: string): Line => ({ speaker, text });

/**
 * Every word Build Our Bayan shows, in English. Each leader sounds like themselves: Ate Bea is a
 * cheerful big sister, Tatay jokes, Nanay fusses, the principal runs a class, the President gives a
 * speech, and the parish priest blesses. Dialogue, names, and wrong choices are drafts for the
 * teacher to review. Strings starting with TODO are still to be supplied and show as "to be added".
 */
export const bayan: BayanContent = {
  stages: [
    { title: "icebreaker", instructions: "Find the leader of each community. Look for the question marks." },
    { title: "sacred scripture", instructions: "Read the verse, then talk to the parish priest to build the church." },
    { title: "church teaching", instructions: "Walk into the church and talk to each leader." },
    { title: "truths to remember", instructions: "Open the plaques in the plaza one at a time." },
    { title: "serve our town", instructions: "Each group finishes its sentence for its building." },
  ],

  title: {
    title: "build our bayan",
    body: "Last time the Holy Spirit made us one community and we built a wall. Today our community builds its whole bayan.",
  },

  guide: {
    id: "bea",
    opening: [
      "Hi! I'm Ate Bea. Welcome to our bayan!",
      "Do you remember last time? The Holy Spirit made us one community, and we built a wall together.",
      "Who built that wall? You, me, and us! A community is all of us, working together.",
      "Today our community builds its whole bayan. Look around: our neighbors already have wood, stones, and tools.",
      "But nothing is built yet. Why? Because a community needs someone to guide it. It needs a leader.",
      "Sometimes the leader can be you or me. But some communities come with leaders who are given to guide us.",
      "Let's meet the leaders of our home, our school, our country, and our parish!",
      "Walk to anyone with a question mark. Click a spot, or use the arrow keys. Then press Talk.",
    ],
    idle: [
      "Psst! Look for someone with a question mark.",
      "Follow the yellow arrow to the next leader!",
      "Need help? Click on a leader, and you will walk right to them.",
    ],
    allFound: [
      "Wow, you found all four leaders! Look how our bayan has grown.",
      "Our home, our school, and our town hall all stand, because each community has a leader who guides it.",
      "But look at our church. It is still just a wall. Why do you think it is unfinished?",
    ],
  },

  people: {
    pupil: { name: "You", sprite: "pupil" },
    bea: { name: "Ate Bea", sprite: "guide" },
    tatay: { name: "Tatay", sprite: "father" },
    nanay: { name: "Nanay", sprite: "mother" },
    principal: { name: "Principal Santos", sprite: "principal" },
    teacher: { name: "Teacher Grace", sprite: "teacher" },
    president: { name: "The President", sprite: "president" },
    priest: { name: "Father", sprite: "priest" },
    "mang-jose": { name: "Mang Jose", sprite: "villager-a" },
    "aling-rosa": { name: "Aling Rosa", sprite: "villager-c" },
    "mang-tonyo": { name: "Mang Tonyo", sprite: "villager-b" },
    "ate-liza": { name: "Ate Liza", sprite: "villager-e" },
    "kuya-dan": { name: "Kuya Dan", sprite: "villager-d" },
    "mang-pedro": { name: "Mang Pedro", sprite: "villager-b" },
    "aling-cora": { name: "Aling Cora", sprite: "villager-e" },
    "lolo-ramon": { name: "Lolo Ramon", sprite: "villager-a" },
    paolo: { name: "Paolo", sprite: "kid-a" },
    joy: { name: "Joy", sprite: "kid-b" },
    "aling-nena": { name: "Aling Nena", sprite: "tindera" },
    "mang-ben": { name: "Mang Ben", sprite: "vendor" },
    bantay: { name: "Bantay", sprite: "dog" },
    muning: { name: "Muning", sprite: "cat" },
    "hen-1": { name: "the hen", sprite: "chicken" },
    "hen-2": { name: "the hen", sprite: "chicken" },
    "hen-3": { name: "the hen", sprite: "chicken" },
    "chick-1": { name: "the chick", sprite: "chick" },
    "chick-2": { name: "the chick", sprite: "chick" },
  },

  lots: {
    house: {
      name: "home",
      leaders: "Parents",
      questions: [
        {
          speaker: "tatay",
          prompt: "Who leads the home?",
          choices: ["Our neighbors", "Our parents", "The youngest child"],
          answer: 1,
          hint: say("tatay", "Ha ha! Our neighbors are kind, but they go home to their own families. Who is in charge in our house?"),
          praise: say("nanay", "That's right! Tatay and Nanay lead our home, with God's help."),
        },
        {
          speaker: "nanay",
          prompt: "What do our parents do for us?",
          choices: ["They do all our homework", "They care for us and guide us", "They let us do anything we want"],
          answer: 1,
          hint: say("nanay", "My child, if we did your homework, how would you learn? Think of what we do for you every day."),
          praise: say("tatay", "Yes! We care for you and guide you, because we love you."),
        },
        {
          speaker: "tatay",
          prompt: "When a child makes a mistake at home, what do good parents do?",
          choices: ["Pretend they did not see it", "Laugh at the child", "Correct the child with love and help them do better"],
          answer: 2,
          hint: say("tatay", "Hmm, would that help the child grow? Think of what a loving parent would do."),
          praise: say("nanay", "Exactly. We correct you because we want you to grow into a good person."),
        },
        {
          speaker: "nanay",
          prompt: "How can children help their parents lead the home?",
          choices: ["Obey, help with chores, and pray together", "Hide when it is time to clean", "Argue every time they are asked"],
          answer: 0,
          hint: say("nanay", "Oh no! That would not help our family at all. How can you help us at home?"),
          praise: say("tatay", "That's my child! A family that helps and prays together stays together."),
        },
      ],
      script: {
        greet: [
          say("tatay", "There you are! Come, come! Nanay and I were just talking about you."),
          say("nanay", "We have wood, nails, and a lot of love. But a home is not only made of wood, is it?"),
          say("tatay", "Before we build, let's see if you know how a family works. Ready? Here we go!"),
        ],
        resume: [say("nanay", "Welcome back, my child. Let's continue where we left off.")],
        done: [
          say("nanay", "Thank you, my child! Now everyone knows who guides our family."),
          say("tatay", "Neighbors! Grab your tools. Let's build our home!"),
        ],
        thanks: [
          say("nanay", "Our home stands because we all help each other."),
          say("tatay", "Have you eaten yet? Come back later for a snack!"),
        ],
      },
      chatter: {
        waiting: ["We have wood, but who will guide our family?", "Where do we even start?", "Has anyone seen Tatay's hammer?"],
        done: ["Our home is complete!", "Thank you!", "What a beautiful home!"],
      },
      group: "Family group",
      starter: "As a family member, I",
    },
    school: {
      name: "school",
      leaders: "The principal and teachers",
      questions: [
        {
          speaker: "principal",
          prompt: "Who leads the school?",
          choices: ["The principal", "The school guard", "The canteen staff"],
          answer: 0,
          hint: say(
            "principal",
            "Our guard keeps the gate safe and our canteen keeps us fed. But who leads the whole school?",
          ),
          praise: say("teacher", "Correct! The principal leads our school, and the teachers help lead each class."),
        },
        {
          speaker: "teacher",
          prompt: "What do our teachers and principal do for us?",
          choices: ["They play games all day", "They teach and guide us", "They take our tests for us"],
          answer: 1,
          hint: say("teacher", "If I took your tests, what would you learn? Think about what happens in class every day."),
          praise: say("principal", "Very good! We teach and guide you so you grow wise and kind."),
        },
        {
          speaker: "principal",
          prompt: "What does a principal do every day?",
          choices: [
            "Sells snacks at recess",
            "Drives the school bus",
            "Leads the teachers and keeps the school safe and in order",
          ],
          answer: 2,
          hint: say("principal", "Those are helpful jobs, but they are not mine. Think bigger: the whole school!"),
          praise: say("teacher", "Right! Our principal looks after every teacher and every pupil."),
        },
        {
          speaker: "teacher",
          prompt: "How can pupils help their teachers lead the class?",
          choices: ["Talk while the teacher is talking", "Listen, follow the rules, and do their best", "Skip class when it rains"],
          answer: 1,
          hint: say("teacher", "Hmm, would that help our class learn? What does a good pupil do?"),
          praise: say("principal", "Excellent! Good pupils make a good school."),
        },
      ],
      script: {
        greet: [
          say("principal", "Good morning, class! Settle down, please. Settle down."),
          say("teacher", "Our books, chairs, and blackboards are ready. But a school needs more than things."),
          say("principal", "So, a short quiz. Don't worry, this one is not graded!"),
        ],
        resume: [say("teacher", "Welcome back, class. Let's continue our quiz.")],
        done: [
          say("principal", "Outstanding work! You all get a star."),
          say("teacher", "Now our school can open its doors. Everyone, let's build!"),
        ],
        thanks: [
          say("teacher", "Keep reading, keep asking, keep growing!"),
          say("principal", "And no running in the hallway."),
        ],
      },
      chatter: {
        waiting: ["The books are ready. Who will teach us?", "We need someone to guide the pupils.", "Where does this blackboard go?"],
        done: ["Our school is open!", "Time to learn!", "I can't wait for recess!"],
      },
      group: "School group",
      starter: "As a student, I",
    },
    hall: {
      name: "town hall",
      leaders: "The President",
      questions: [
        {
          speaker: "president",
          prompt: "Who leads our country?",
          choices: ["The town baker", "The jeepney driver", "The President"],
          answer: 2,
          hint: say("president", "They serve our town well, but the whole country? Think of the highest office in the land."),
          praise: say("president", "Correct! The President leads our country."),
        },
        {
          speaker: "president",
          prompt: "What does the President do?",
          choices: ["Serves and leads the people", "Owns every house in the country", "Decides if it will rain or shine"],
          answer: 0,
          hint: say("president", "Ha ha! Not even the President can order the weather. What is the President's job?"),
          praise: say("president", "Yes! The President serves and leads the people. To lead is to serve."),
        },
        {
          speaker: "president",
          prompt: "How is the President of the Philippines chosen?",
          choices: ["By a coin toss", "By the people, through an election", "By the President's own family"],
          answer: 1,
          hint: say("president", "No, no. In our country, the people have the power to choose. How do they do it?"),
          praise: say("president", "That's right! Every vote counts. The people choose their leader."),
        },
        {
          speaker: "president",
          prompt: "How can young Filipinos help their country?",
          choices: ["Throw trash anywhere", "Do nothing at all", "Follow the law, respect others, and love our country"],
          answer: 2,
          hint: say("president", "Would that make our country better? Even children can help. How?"),
          praise: say("president", "Wonderful! Good citizens make a great nation."),
        },
      ],
      script: {
        greet: [
          say("president", "Good day, my fellow Filipinos!"),
          say("president", "Our town hall is not yet built, but our people are ready. A nation needs someone to serve and lead it."),
          say("president", "Answer my questions, and together, let us build!"),
        ],
        resume: [say("president", "Welcome back, my fellow citizen. Let us continue.")],
        done: [
          say("president", "Thank you, citizen! Let the building of our town hall begin!"),
          say("president", "And raise our flag high!"),
        ],
        thanks: [say("president", "Serve your country in small ways every day.")],
      },
      chatter: {
        waiting: ["Our town needs someone to lead it.", "Who will keep our town in order?", "Where do we put the flagpole?"],
        done: ["Hooray! Our flag is flying!", "Our town is in good hands.", "Long live the Philippines!"],
      },
      group: "Town group",
      starter: "As a citizen, I",
    },
    church: {
      name: "parish",
      leaders: "The parish priest",
      questions: [
        {
          speaker: "priest",
          prompt: "Who leads the parish?",
          choices: ["The choir leader", "The parish priest", "The church caretaker"],
          answer: 1,
          hint: say("priest", "They all serve our parish with love. But who was sent by the bishop to lead it?"),
          praise: say("priest", "Yes. The parish priest leads the parish, sent by our bishop."),
        },
        {
          speaker: "priest",
          prompt: "What does the parish priest do?",
          choices: ["He rings the bell all day", "He leads us in worship and guides the parish", "He builds the chapel by himself"],
          answer: 1,
          hint: say("priest", "I do ring the bell sometimes! But that is not my main work. What do we do when we gather here?"),
          praise: say("priest", "Correct. I lead you in worship and guide our parish family."),
        },
        {
          speaker: "priest",
          prompt: "What does the parish priest celebrate with us every Sunday?",
          choices: ["A basketball game", "A birthday party", "The Holy Mass"],
          answer: 2,
          hint: say("priest", "Those are fun, but every Sunday we gather for something holy. What is it?"),
          praise: say("priest", "Yes, the Holy Mass, where Jesus gathers us as one family."),
        },
        {
          speaker: "priest",
          prompt: "How can we help our parish priest?",
          choices: ["Pray for him and serve in the parish", "Leave Mass early", "Stay away from the parish"],
          answer: 0,
          hint: say("priest", "That would make me a little sad. How can we help our parish grow?"),
          praise: say("priest", "Thank you, my child. Please pray for me, as I pray for you."),
        },
      ],
      script: {
        greet: [
          say("priest", "Peace be with you, my child."),
          say("priest", "Our parish family gathers here. We even have the wall we built together last time."),
          say("priest", "Before we go on, let me ask you a few questions about our parish."),
        ],
        resume: [say("priest", "Ah, you are back. God bless you. Let us continue.")],
        done: [
          say("priest", "God bless you! Now you know who leads our parish."),
          say("priest", "But look at our church. It is still only a wall. We will need more than this."),
        ],
        thanks: [say("priest", "Our church is not finished yet. Soon we will build it together. Pray for it!")],
      },
      chatter: {
        waiting: ["We have our wall from last time!", "Who will lead our parish?", "These stones are heavy!"],
        done: ["Our parish has a leader!", "But our church still needs more.", "Let us pray for our church."],
      },
      group: "Parish group",
      starter: "As a parishioner, I",
    },
  },

  townsfolk: {
    paolo: ["Come on, let's play!", "Tag, you're it!", "Joy, wait for me!"],
    joy: ["Look, a butterfly!", "I love our bayan!", "Paolo, you can't catch me!"],
    "aling-nena": ["Bread and candies here!", "Good morning, children!", "Warm bread, just baked!"],
    "mang-ben": ["Tahooo! Taho!", "Taho! Still warm!", "Taho with extra syrup!"],
    "mang-jose": ["Hammer, nails, ready!"],
    "aling-rosa": ["Mind the wood, children!"],
    "mang-tonyo": ["These books are for the school."],
    "ate-liza": ["I'll be a teacher one day!"],
    "kuya-dan": ["I carry the flagpole!"],
    "mang-pedro": ["A town hall needs strong walls."],
    "aling-cora": ["I pray for our parish every day."],
    "lolo-ramon": ["I helped build the old chapel, you know."],
  },

  // Draft: "Every community has leaders who guide us and help us grow. So why is our church still unfinished?"
  closing: { title: "every community has leaders", body: "TODO closing card wording" },

  verse: { reference: "Ephesians 2:19-22", text: "TODO verse wording in the translation the class uses" },

  churchQuestions: [
    {
      speaker: "priest",
      prompt: "What is the foundation of God's household?",
      choices: ["Gold and silver", "The apostles and prophets", "The tallest stones"],
      answer: 1,
      hint: say("priest", "Listen to the verse again, my child. Who did God build His household upon?"),
      praise: say("priest", "Yes. The apostles and prophets are our foundation."),
    },
    {
      speaker: "priest",
      prompt: "Who are the walls of God's household?",
      choices: ["Only the priests", "Only the strangers", "All of us, the members of God's household"],
      answer: 2,
      hint: say("priest", "Not only a few of us, my child. Who belongs to God's household?"),
      praise: say("priest", "Yes. All of us together are the walls of God's household."),
    },
    {
      speaker: "priest",
      prompt: "Who is the capstone?",
      choices: ["Christ Jesus", "The Pope", "The parish priest"],
      answer: 0,
      hint: say("priest", "Not me, and not even the Pope. Who holds the whole building together?"),
      praise: say("priest", "Yes! Christ Jesus is the capstone who holds us all together."),
    },
  ],

  // Role sentences are drafts for the teacher to check against CFC 1409-1410.
  figures: [
    { title: "The Pope", name: "Pope Leo XIV", role: "The successor of Saint Peter, he leads the whole Church." },
    {
      title: "The Papal Nuncio",
      name: "Archbishop Charles John Brown",
      role: "He represents the Pope to the Church and the government of the Philippines.",
    },
    {
      title: "The Archbishop of Tuguegarao",
      name: "Archbishop Ricardo Baccay",
      role: "He leads and cares for all the parishes of the Archdiocese of Tuguegarao.",
    },
    {
      title: "Our parish priest",
      name: "TODO parish priest's name",
      role: "He leads our parish, celebrates the sacraments, and cares for us.",
    },
    { title: "A deacon", role: "He serves the parish by proclaiming the Gospel, baptizing, and helping the poor." },
    { title: "A lay person", role: "Every baptized person shares in the Church's mission at home, in school, and in town." },
  ],

  plaques: [
    { title: "who chose the leaders of the church", body: "TODO Truths to Remember, first plaque" },
    { title: "how we share in its mission", body: "TODO Truths to Remember, second plaque" },
    { title: "for whom we pray", body: "TODO Truths to Remember, third plaque" },
  ],

  feedback: { right: "That's right!", tryAgain: "Try again" },
};
