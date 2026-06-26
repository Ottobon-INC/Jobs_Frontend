export const COMPANIES = [
    {
        id: 'tcs',
        slug: 'tcs',
        name: 'TCS',
        industry: 'IT Services',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/TATA_Consultancy_Services_Logo.svg',
        hq: 'Mumbai, India',
        locations: ['Across India'],
        category: 'Major IT Services & Consulting',
        hiringSeasons: 'Mass Recruitment (July-Sept)',
        hiringType: 'Heavy Campus Placements',
        hiringZone: 'on-campus',
        coverImage: '/tcs_office.png',
        roles: ['Ninja Role', 'Digital Role', 'Prime Role'],
        difficulty: 'Easy',
        difficultyLevel: 2,
        roundsCount: 3,
        eligibility: {
            academic: "60% or 6.0 CGPA throughout",
            qualification: "BE/B.Tech, ME/M.Tech, MCA, M.Sc",
            gapInEducation: "Max 24 months",
            backlogs: "No active backlogs"
        },
        selectionProcess: [
            { name: 'Foundation Section', details: 'Numerical, Verbal, and Reasoning ability.' },
            { name: 'Advanced Section', details: 'Advanced Quants, Reasoning, and Coding.' },
            { name: 'Interview', details: 'Technical + Managerial + HR round.' }
        ],
                                        testPattern: [
            {
                section: 'Round 1 (Foundation) - Numerical Ability',
                questions: '20 Qs',
                duration: '25 mins'
            },
            {
                section: 'Round 1 (Foundation) - Verbal English',
                questions: '25 Qs',
                duration: '25 mins'
            },
            {
                section: 'Round 1 (Foundation) - Reasoning Ability',
                questions: '20 Qs',
                duration: '25 mins'
            },
            {
                section: 'Round 2 (Advanced) - Advanced Aptitude + Advanced Reasoning Ability',
                questions: 'Approx. 15 (8 Quants, 7-8 Reasoning)',
                duration: '25 mins'
            },
            {
                section: 'Round 2 (Advanced) - Advanced Coding',
                questions: '3 Qs',
                duration: '90 mins'
            },
        ],
                                        syllabus: [
        {
            round: 'Verbal Ability',
            topics: [
                {
                    name: 'Spelling',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Grammar',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Selecting Words',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Error Correction',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Error Identification',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Sentence Completion',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Synonyms and Antonyms',
                    questions: '1 or 2',
                    duration: '30 secs',
                    difficulty: 'Easy'
                },
                {
                    name: 'Cloze Test',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Reading and Comprehension',
                    questions: '1',
                    duration: '3 mins',
                    difficulty: 'High'
                },
            ]
        },
        {
            round: 'Advanced Quantitative',
            topics: [
                {
                    name: 'HCF & LCM and Number System',
                    questions: '0 or 1',
                    duration: '1 min 10 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Geometry',
                    questions: '0 or 1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Ages',
                    questions: '0 or 1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Allegations and Mixtures',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Averages',
                    questions: '0 or 1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Clocks and Calendars',
                    questions: '0 or 1',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Equations',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Percentages',
                    questions: '0 or 1',
                    duration: '2 mins',
                    difficulty: 'Medium'
                },
                {
                    name: 'Permutations and Combinations',
                    questions: '1',
                    duration: '1 min 10 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Probability',
                    questions: '0 or 1',
                    duration: '1 min 25 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Profit and Loss',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Ratios and Proportion',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Series and Progressions',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Time, Speed and Distance',
                    questions: '1',
                    duration: '1 min 25 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Time and Work',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Mean, Median, Mode, Standard Deviation, and Variance',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Data Interpretation',
                    questions: '0 or 1',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Graphical Data Interpretation',
                    questions: '0 or 1',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Pie Charts',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Tabular Data Interpretation',
                    questions: '0 or 1',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Simple Arithmetic Operations',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Advanced Reasoning',
            topics: [
                {
                    name: 'Words Identification',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Meaningful Word Creation',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Letter Analogy',
                    questions: '1 or 2',
                    duration: '30 secs',
                    difficulty: 'Easy'
                },
                {
                    name: 'Blood Relations',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Complex Seating Arrangements',
                    questions: '1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Distance and Directions',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Odd Man Out',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Symbols and Notations',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Cube and Paper Folding',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Data Sufficiency',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Decision Making',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Syllogism',
                    questions: '1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Prepositional Reasoning',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Visual Reasoning',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Round 1 (Foundation) - Numerical Ability',
            topics: [
                'Total Questions: 20 Qs',
                'Duration: 25 mins',
                'Note: Programming Logic (C MCQ) is NO LONGER ASKED.',
            ]
        },
        {
            round: 'Round 1 (Foundation) - Reasoning Ability',
            topics: [
                'Total Questions: 20 Qs',
                'Duration: 25 mins',
                'Note: Programming Logic (C MCQ) is NO LONGER ASKED.',
            ]
        },
        {
            round: 'Round 2 (Advanced) - Advanced Coding',
            topics: [
                'Total Questions: 3 Qs',
                'Duration: 90 mins',
                'Languages Allowed: C, C++, Java, Python',
            ]
        },
    ],
        registrationProcess: [
            'Visit TCS NextStep portal',
            'Register under "IT" category',
            'Fill application form and generate CT/DT ID',
            'Submit application'
        ],
        compensation: {
            base: '3.5 LPA - 9 LPA',
            bonus: 'N/A',
            stock: 'N/A',
            relocation: 'Variable',
            totalYear1: '₹4,00,000 - ₹9,00,000'
        },
        prepFocus: 'Practice quantitative aptitude. For Digital/Prime, focus on advanced DSA.',
        insiderScoop: 'Communication skills are the ultimate dealbreaker. Digital role requires strong coding speed.',
        jobsLink: '/jobs?company=TCS'
    },
    {
        id: 'wipro',
        slug: 'wipro',
        name: 'Wipro',
        industry: 'IT Services',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg',
        hq: 'Bangalore, India',
        locations: ['Across India'],
        category: 'Major IT Services & Consulting',
        hiringSeasons: 'Mass Recruitment (July-Sept)',
        hiringType: 'Campus Placements',
        hiringZone: 'on-campus',
        roles: ['Project Engineer', 'Turbo Role', 'WILP'],
        difficulty: 'Easy',
        difficultyLevel: 2,
        roundsCount: 2,
        eligibility: {
            academic: "60% or 6.0 CGPA throughout",
            qualification: "BCA, B.Sc, BE/B.Tech",
            backlogs: "Max 1 active backlog",
            gapInEducation: "Max 3 years"
        },
        selectionProcess: [
            { name: 'Online Assessment', details: 'Aptitude + Essay Writing.' },
            { name: 'Business Discussion', details: 'Interview round with technical and behavioral questions.' }
        ],
                                        testPattern: [
            {
                section: 'Quants',
                questions: '16 Qs',
                duration: '16 mins'
            },
            {
                section: 'Logical',
                questions: '14 Qs',
                duration: '14 mins'
            },
            {
                section: 'Verbal',
                questions: '18 - 22',
                duration: '18 mins'
            },
            {
                section: 'Coding',
                questions: '2 Qs',
                duration: '60 mins'
            },
            {
                section: 'Essay Writing',
                questions: '1 Qs',
                duration: '20 mins'
            },
        ],
                                        syllabus: [
        {
            round: 'Quants',
            topics: [
                {
                    name: 'LCM & HCF',
                    questions: '0 or 1',
                    duration: '1 min 10 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Divisibility',
                    questions: '1 or 2',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Numbers, decimal fractions, and power',
                    questions: '0 or 1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Time & Work',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Pipes and Cisterns',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Averages',
                    questions: '0 or 1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Profit and Loss',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Simple and Compound Interest',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Time, Speed, and Distance',
                    questions: '1',
                    duration: '1 min 25 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Problems on Trains',
                    questions: '1',
                    duration: '1 min 25 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Geometry, Coordinate Geometry',
                    questions: '0 or 1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Clocks & Calendar',
                    questions: '0 or 1',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Logarithms',
                    questions: '1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Permutation and Combinations',
                    questions: '1',
                    duration: '1 min 10 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Probability',
                    questions: '0 or 1',
                    duration: '1 min 25 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Ratio & Proportion',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Algebra',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Surds & Indices',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Allegations and Mixtures',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Problem on Ages',
                    questions: '0 or 1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Verbal',
            topics: [
                {
                    name: 'Synonyms & Antonyms',
                    questions: '1 or 2',
                    duration: '30 secs',
                    difficulty: 'Easy'
                },
                {
                    name: 'Contextual Vocabulary',
                    questions: '1 or 2',
                    duration: '30 secs',
                    difficulty: 'Easy'
                },
                {
                    name: 'Jumbled Sentence',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Sentence Formation, Improvement & Construction',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Inferential and Literal Comprehension (Ordering)',
                    questions: '1',
                    duration: '3 mins',
                    difficulty: 'High'
                },
                {
                    name: 'Error Identification',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Subject-Verb Agreement',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Tenses & Articles',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Preposition & Conjunctions',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Speech & Voices',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Logical',
            topics: [
                {
                    name: 'Coding deductive logic',
                    questions: '1 or 2',
                    duration: '2 mins',
                    difficulty: 'High'
                },
                {
                    name: 'Blood Relation',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Directional Sense',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Objective Reasoning',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Selection decision tables',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Seating Arrangements',
                    questions: '1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Mathematical Orders',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Inferred Meaning',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Logical word sequence',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Data sufficiency',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Syllogism',
                    questions: '1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Data Arrangement',
                    questions: '1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
            ]
        },
        {
            round: 'Coding',
            topics: [
                {
                    name: 'Arrays and Matrices (1D, Rotation, Multiplication, Operations, Inverting)',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Linked List (Basic Operations, Circular)',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Strings (Manipulation, Character operations)',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Stacks (Push/Pop, Applications)',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Searching and Sorting (Algorithms, Applications)',
                    questions: '1 or 2',
                    duration: '2 mins',
                    difficulty: 'High'
                },
            ]
        },
        {
            round: 'Essay Writing',
            topics: [
                'Total Questions: 1 Qs',
                'Duration: 20 mins',
            ]
        },
    ],
        registrationProcess: [
            'Register on SuperSet or Wipro career portal',
            'Complete profile and fill details',
            'Submit application'
        ],
        compensation: {
            base: '3.5 LPA - 6.5 LPA',
            bonus: 'N/A',
            stock: 'N/A',
            relocation: 'Variable',
            totalYear1: '₹4,00,000 - ₹7,00,000'
        },
        prepFocus: 'Focus on aptitude and basic programming logic. Essay writing is important for communication score.',
        insiderScoop: 'Communication is key. Similar process to TCS Ninja. Essay writing round is an elimination factor.',
        jobsLink: '/jobs?company=Wipro'
    },
    {
        id: 'infosys',
        slug: 'infosys',
        name: 'Infosys',
        industry: 'IT Services',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
        hq: 'Bangalore, India',
        locations: ['Across India'],
        category: 'Major IT Services & Consulting',
        hiringSeasons: 'Mass Hiring',
        hiringType: 'HackWithInfy / Infytq',
        hiringZone: 'on-campus',
        coverImage: '/infosys_office.png',
        roles: ['System Engineer', 'Specialist Programmer', 'Power Programmer'],
        difficulty: 'Medium',
        difficultyLevel: 3,
        roundsCount: 2,
        eligibility: {
            academic: "60% throughout (10th, 12th, Graduation)",
            qualification: "BE/B.Tech, ME/M.Tech, MCA, M.Sc",
            backlogs: "No active backlogs",
            gapInEducation: "Max 1 year"
        },
        selectionProcess: [
            { name: 'Online Assessment', details: '6 sections including coding and puzzles.' },
            { name: 'Interview', details: 'Technical and HR mixed round.' }
        ],
                                        testPattern: [
            {
                section: 'Logical Ability',
                questions: '15 Qs',
                duration: '25 mins'
            },
            {
                section: 'Technical Ability (Mathematical)',
                questions: '10 Qs',
                duration: '35 mins'
            },
            {
                section: 'Verbal Ability',
                questions: '20 Qs',
                duration: '20 mins'
            },
            {
                section: 'Pseudo Code',
                questions: '5 Qs',
                duration: '10 mins'
            },
            {
                section: 'Puzzle Solving',
                questions: '4 Qs',
                duration: '10 mins'
            },
            {
                section: 'English Grammar',
                questions: '5 Qs',
                duration: '10 mins'
            },
            {
                section: 'English Writing',
                questions: '1 Qs',
                duration: '10 mins'
            },
        ],
                                        syllabus: [
        {
            round: 'Mathematical Ability',
            topics: [
                {
                    name: 'Percentages',
                    questions: '0 or 1',
                    duration: '2 mins',
                    difficulty: 'Medium'
                },
                {
                    name: 'Data Interpretation',
                    questions: '0 or 1',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Permutation and Combination',
                    questions: '1',
                    duration: '1 min 10 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Probability',
                    questions: '0 or 1',
                    duration: '1 min 25 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Areas, Shapes, Perimeter',
                    questions: '0 or 1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Speed Time and Distance / Boats and Streams',
                    questions: '1',
                    duration: '1 min 25 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Time and Work',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Profit and Loss | Mixtures & Allegation',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Problem on Ages',
                    questions: '0 or 1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Divisibility',
                    questions: '1 or 2',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Number Decimal & Fractions',
                    questions: '0 or 1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Series and Progression',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'LCM and HCF',
                    questions: '0 or 1',
                    duration: '1 min 10 secs',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Logical Reasoning',
            topics: [
                {
                    name: 'Arrangements',
                    questions: '1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Puzzles',
                    questions: '1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Syllogisms',
                    questions: '1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Coding-Decoding',
                    questions: '1 or 2',
                    duration: '2 mins',
                    difficulty: 'High'
                },
                {
                    name: 'Number series',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Cryptarithmetic',
                    questions: '1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Clocks and Calendar',
                    questions: '0 or 1',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Data Sufficiency',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Most logical choice',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Logical Deduction',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Verbal Ability',
            topics: [
                {
                    name: 'Reading Comprehension',
                    questions: '1',
                    duration: '3 mins',
                    difficulty: 'High'
                },
                {
                    name: 'Sentence Correction',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Sentence selection',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Sentence Completion',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Para Jumbles',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Spotting error',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Analogy',
                    questions: '1 or 2',
                    duration: '30 secs',
                    difficulty: 'Easy'
                },
                {
                    name: 'Fill in the Blanks',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'One Word Substitution',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Critical Reasoning',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Pseudo Code',
            topics: [
                'Total Questions: 5 Qs',
                'Duration: 10 mins',
            ]
        },
        {
            round: 'Puzzle Solving',
            topics: [
                'Total Questions: 4 Qs',
                'Duration: 10 mins',
            ]
        },
        {
            round: 'English Grammar',
            topics: [
                'Total Questions: 5 Qs',
                'Duration: 10 mins',
            ]
        },
        {
            round: 'English Writing',
            topics: [
                'Total Questions: 1 Qs',
                'Duration: 10 mins',
            ]
        },
    ],
        registrationProcess: [
            'Visit Infosys Careers portal',
            'Register and create a profile',
            'Apply for available freshers drives',
            'Submit application'
        ],
        compensation: {
            base: '₹3.6L - ₹9.5L',
            bonus: 'N/A',
            stock: 'N/A',
            relocation: 'N/A',
            totalYear1: '₹4L - ₹10L'
        },
        prepFocus: 'Practice basic coding on their platform. Power Programmer role requires advanced DSA.',
        insiderScoop: 'HackWithInfy is the best way to get a high-paying role here. Puzzles round is unique and needs practice.',
        jobsLink: '/jobs?company=Infosys'
    },
    {
        id: 'google',
        slug: 'google',
        name: 'Google',
        industry: 'Tech',
        logo: 'https://logos.hunter.io/google.com',
        hq: 'Mountain View, CA',
        locations: ['Bangalore', 'Hyderabad', 'Pune', 'Gurgaon'],
        category: 'Global Big Tech & AI Labs',
        hiringSeasons: 'Primarily Fall (Sept-Nov) for next summer, occasional Spring hires.',
        hiringType: 'Off-Campus / Referral heavy',
        hiringZone: 'off-campus',
        coverImage: '/google_office.png',
        roles: ['SDE', 'Data Analyst', 'Cloud Engineer'],
        difficulty: 'Hard',
        difficultyLevel: 4,
        roundsCount: 4,
        eligibility: {
            academic: "Degree in CS or related technical field",
            qualification: "B.Tech/BE, M.Tech/ME, PhD",
            backlogs: "No active backlogs",
            experience: "Freshers / University Grads"
        },
        selectionProcess: [
            { name: 'Online Assessment', details: '60-90 mins, 2 DSA questions (Medium/Hard).' },
            { name: 'Recruiter Screen', details: 'Informal call to discuss background and role fit.' },
            { name: 'Technical Interviews', details: '3-4 rounds of DSA problem solving on shared editor.' },
            { name: 'Googliness', details: 'Behavioral round focused on leadership and culture fit.' }
        ],
        testPattern: [
            { section: 'Coding', questions: '2 Qs', duration: '90 mins' },
            { section: 'Theory/MCQ', questions: 'N/A', duration: 'N/A' }
        ],
        syllabus: [
            { round: 'Coding', topics: ['Graphs', 'Dynamic Programming', 'Recursion', 'Backtracking'] },
            { round: 'Theory', topics: ['OS Internals', 'Networking Basics', 'Memory Management'] }
        ],
        registrationProcess: [
            'Apply via Google Careers portal',
            'Optimize resume with measurable accomplishments',
            'Complete the Online Assessment if invited',
            'Wait for recruiter outreach'
        ],
        compensation: {
            base: '₹18L - ₹25L',
            bonus: '₹2L - ₹3L',
            stock: '₹30L+ over 4 years',
            relocation: '₹2L',
            totalYear1: '₹28L - ₹35L'
        },
        prepFocus: '80% Graphs/DP. High focus on time and space complexity analysis.',
        insiderScoop: 'Communication is key. Explain your thought process out loud even if you haven\'t found the optimal solution yet.',
        jobsLink: '/jobs?company=Google'
    },
    {
        id: 'meta',
        slug: 'meta',
        name: 'Meta',
        industry: 'Tech',
        logo: 'https://logos.hunter.io/meta.com',
        hq: 'Menlo Park, CA',
        locations: ['London', 'New York', 'Singapore', 'Bangalore'],
        category: 'Global Big Tech & AI Labs',
        hiringSeasons: 'Fall (Sept-Oct)',
        hiringType: 'Referral heavy',
        hiringZone: 'off-campus',
        coverImage: '/meta_office.png',
        roles: ['Software Engineer', 'Product Designer'],
        difficulty: 'Hard',
        difficultyLevel: 5,
        roundsCount: 4,
        eligibility: {
            academic: "Strong academic record in CS or related field",
            qualification: "Bachelors, Masters, or PhD",
            skills: "Expertise in at least one core language (C++, Java, Python)"
        },
        selectionProcess: [
            { name: 'Technical Phone Screen', details: 'Live coding on CoderPad (45 mins).' },
            { name: 'Interview Loop', details: '3-4 virtual onsite rounds including Coding and Behavioral.' },
            { name: 'Team Matching', details: 'Discussion with specific teams for placement.' }
        ],
        testPattern: [
            { section: 'Coding Screen', questions: '2 Qs', duration: '45 mins' },
            { section: 'Onsite Coding', questions: '2 Qs per round', duration: '45 mins each' }
        ],
        syllabus: [
            { round: 'Coding', topics: ['Arrays', 'Strings', 'Trees', 'Graphs', 'Dynamic Programming'] },
            { round: 'Behavioral', topics: ['Conflict Resolution', 'Adaptability', 'Meta Core Values'] }
        ],
        registrationProcess: [
            'Search for "University Grad" roles on Meta Careers',
            'Get a referral for higher response rate',
            'Submit application and portfolio',
            'Schedule technical screen'
        ],
        compensation: {
            base: '₹20L - ₹26L',
            bonus: '10% - 15%',
            stock: '₹40L over 4 years',
            relocation: '₹2L',
            totalYear1: '₹35L - ₹40L'
        },
        prepFocus: 'Meta loves speed. Practice solving 2 Mediums in 35 mins.',
        insiderScoop: 'Speed is everything. If you take too long to arrive at the optimal solution, it\'s a reject. Practice without an IDE.',
        jobsLink: '/jobs?company=Meta'
    },
    {
        id: 'nvidia',
        slug: 'nvidia',
        name: 'NVIDIA',
        industry: 'Semiconductors',
        logo: 'https://logos.hunter.io/nvidia.com',
        hq: 'Santa Clara, CA',
        locations: ['Bangalore', 'Pune', 'Hyderabad'],
        category: 'Global Big Tech & AI Labs',
        hiringSeasons: 'Early Fall',
        hiringType: 'University Recruiting / Intern-to-FTE',
        hiringZone: 'on-campus',
        coverImage: '/nvidia_office.png',
        roles: ['Hardware Engineer', 'AI Research', 'SDE'],
        difficulty: 'Hard',
        difficultyLevel: 5,
        roundsCount: 5,
        eligibility: {
            academic: "Strong grasp of computer architecture and low-level programming",
            qualification: "B.Tech/M.Tech (EE, ECE, CS)",
            backlogs: "No active backlogs"
        },
        selectionProcess: [
            { name: 'Technical Assessment', details: 'C++, Systems, and DSA focus.' },
            { name: 'Domain Screen', details: 'Live coding on C++/Architecture concepts.' },
            { name: 'Technical Onsite', details: '3-4 rounds of intense deep dives into hardware/software stack.' }
        ],
        testPattern: [
            { section: 'Basic Tech', questions: '30 MCQs', duration: '45 mins' },
            { section: 'Advanced Systems', questions: '15 MCQs + 1 Coding', duration: '60 mins' }
        ],
        syllabus: [
            { round: 'Hardware', topics: ['Computer Architecture (COA)', 'Memory hierarchy', 'Cache design'] },
            { round: 'Software', topics: ['C++ Pointers', 'Memory management', 'CUDA basics', 'Concurrency'] }
        ],
        registrationProcess: [
            'Visit NVIDIA University Careers',
            'Apply for NCG (New College Graduate) roles',
            'Upload resume with hardware/AI project focus',
            'Wait for HackerRank invitation'
        ],
        compensation: {
            base: '₹15L - ₹20L',
            bonus: '₹1L - ₹3L',
            stock: '₹20L - ₹30L',
            relocation: '₹1L',
            totalYear1: '₹20L - ₹28L'
        },
        prepFocus: 'C++, Computer Architecture, CUDA, and System Programming.',
        insiderScoop: 'NVIDIA is extremely technical. They value people who understand "how things work under the hood" of a computer.',
        jobsLink: '/jobs?company=NVIDIA'
    },
    {
        id: 'openai',
        slug: 'openai',
        name: 'OpenAI',
        industry: 'AI',
        logo: 'https://logos.hunter.io/openai.com',
        hq: 'San Francisco, CA',
        locations: ['Remote', 'San Francisco'],
        category: 'Global Big Tech & AI Labs',
        hiringSeasons: 'Rolling admissions',
        hiringType: 'Research Residencies / Direct Hire',
        hiringZone: 'off-campus',
        roles: ['AI Researcher', 'ML Engineer', 'Fullstack Engineer'],
        difficulty: 'Hard',
        difficultyLevel: 5,
        roundsCount: 6,
        process: [
            { name: 'Technical Screen', details: 'Complex algorithm design and ML theory.' },
            { name: 'Deep Dive', details: '4-hour session on a specific research problem.' },
            { name: 'Collaborative Coding', details: 'Pair programming with an OpenAI engineer.' },
            { name: 'Values Alignment', details: 'Long-term AI safety and mission focus.' }
        ],
                testPattern: [
            {
                section: 'Coding',
                questions: '3 Qs',
                duration: '90 mins'
            },
            {
                section: 'Aptitude & MCQs',
                questions: '20 Qs',
                duration: '30 mins'
            }
        ],
        syllabus: [
            {
                round: 'Coding',
                topics: [
                    { name: 'Dynamic Programming', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Graphs', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Trees & Arrays', questions: '1', duration: '30 mins', difficulty: 'Medium' }
                ]
            },
            {
                round: 'CS Fundamentals & MCQs',
                topics: [
                    { name: 'OS & DBMS', questions: '10', duration: '15 mins', difficulty: 'Medium' },
                    { name: 'Computer Networks', questions: '5', duration: '10 mins', difficulty: 'Medium' },
                    { name: 'Aptitude', questions: '5', duration: '5 mins', difficulty: 'Easy' }
                ]
            }
        ],
        registrationProcess: [
            'Visit the company Careers page',
            'Apply through the Campus drive or referral link',
            'Shortlisted candidates receive test link'
        ],
compensation: {
            base: '₹40L - ₹60L',
            bonus: 'N/A',
            stock: 'PPU (Profit Participation Units) - Significant upside',
            relocation: '₹5L',
            totalYear1: '₹60L - ₹80L+'
        },
        prepFocus: 'Transformer architecture, RLHF, and large-scale systems. Research publications are highly valued.',
        insiderScoop: 'The highest bar in the industry. Be prepared to talk about AI safety and your vision for AGI.',
        jobsLink: '/jobs?company=OpenAI'
    },
    {
        id: 'swiggy',
        slug: 'swiggy',
        name: 'Swiggy',
        industry: 'E-commerce',
        logo: 'https://logos.hunter.io/swiggy.com',
        hq: 'Bangalore, India',
        locations: ['Bangalore', 'Hyderabad', 'Chennai'],
        category: 'Top Product & Fintech (India)',
        hiringSeasons: 'Aug-Oct',
        hiringType: 'Campus / Off-Campus',
        hiringZone: 'on-campus',
        roles: ['SDE-1', 'Product Analyst'],
        difficulty: 'Hard',
        difficultyLevel: 4,
        roundsCount: 4,
        process: [
            { name: 'Online Test', details: 'DSA + LLD basics.' },
            { name: 'Technical 1', details: 'Problem solving and DSA (Medium/Hard).' },
            { name: 'Technical 2', details: 'Machine Coding / LLD round.' },
            { name: 'Hiring Manager', details: 'Behavioral and project-deep dive.' }
        ],
        testPattern: [
            {
                section: 'Coding',
                questions: '3 Qs',
                duration: '90 mins'
            },
            {
                section: 'Aptitude & CS Fundamentals',
                questions: '20 Qs',
                duration: '30 mins'
            }
        ],
        syllabus: [
            {
                round: 'Coding',
                topics: [
                    { name: 'Dynamic Programming', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Graphs', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Trees & Arrays', questions: '1', duration: '30 mins', difficulty: 'Medium' }
                ]
            },
            {
                round: 'CS Fundamentals',
                topics: [
                    { name: 'OS & DBMS', questions: '10', duration: '15 mins', difficulty: 'Medium' },
                    { name: 'Computer Networks', questions: '5', duration: '10 mins', difficulty: 'Medium' },
                    { name: 'Aptitude', questions: '5', duration: '5 mins', difficulty: 'Easy' }
                ]
            }
        ],
        registrationProcess: [
            'Visit Swiggy Careers page',
            'Apply through the Campus drive or referral link',
            'Shortlisted candidates receive HackerRank test link'
        ],
        compensation: {
            base: '₹18L - ₹24L',
            bonus: '₹2L - ₹4L',
            stock: '₹10L - ₹15L over 4 years',
            relocation: '₹50k',
            totalYear1: '₹25L - ₹32L'
        },
        prepFocus: 'Machine Coding is crucial. Practice Low Level Design (LLD) and scalable backend systems.',
        insiderScoop: 'They value agility and "hustle". Be ready to explain how you handle scale.',
        jobsLink: '/jobs?company=Swiggy'
    },
    {
        id: 'sarvam',
        slug: 'sarvam-ai',
        name: 'Sarvam AI',
        industry: 'AI',
        logo: 'https://logos.hunter.io/sarvam.ai',
        hq: 'Bangalore, India',
        locations: ['Bangalore'],
        category: 'High-Growth AI & Deep-Tech Startups',
        hiringSeasons: 'Rolling',
        hiringType: 'Direct Outreach / Referrals',
        hiringZone: 'off-campus',
        roles: ['ML Engineer', 'Research Intern'],
        difficulty: 'Hard',
        difficultyLevel: 5,
        roundsCount: 4,
        process: [
            { name: 'Technical Intro', details: 'Deep dive into LLMs and NLP.' },
            { name: 'Coding / Math', details: 'Linear Algebra and Probability for AI.' },
            { name: 'Systems Round', details: 'Optimizing inference and training.' }
        ],
                testPattern: [
            {
                section: 'Coding',
                questions: '3 Qs',
                duration: '90 mins'
            },
            {
                section: 'Aptitude & MCQs',
                questions: '20 Qs',
                duration: '30 mins'
            }
        ],
        syllabus: [
            {
                round: 'Coding',
                topics: [
                    { name: 'Dynamic Programming', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Graphs', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Trees & Arrays', questions: '1', duration: '30 mins', difficulty: 'Medium' }
                ]
            },
            {
                round: 'CS Fundamentals & MCQs',
                topics: [
                    { name: 'OS & DBMS', questions: '10', duration: '15 mins', difficulty: 'Medium' },
                    { name: 'Computer Networks', questions: '5', duration: '10 mins', difficulty: 'Medium' },
                    { name: 'Aptitude', questions: '5', duration: '5 mins', difficulty: 'Easy' }
                ]
            }
        ],
        registrationProcess: [
            'Visit the company Careers page',
            'Apply through the Campus drive or referral link',
            'Shortlisted candidates receive test link'
        ],
compensation: {
            base: '₹25L - ₹40L',
            bonus: 'Variable',
            stock: 'Equity - High Growth Potential',
            relocation: 'N/A',
            totalYear1: '₹35L - ₹50L+'
        },
        prepFocus: 'Focus on Indic LLMs, fine-tuning, and compute optimization.',
        insiderScoop: 'A small, elite team. They look for "first-principles" thinking.',
        jobsLink: '/jobs?company=Sarvam'
    },
    {
        id: 'microsoft',
        slug: 'microsoft',
        name: 'Microsoft',
        industry: 'Tech',
        logo: 'https://logos.hunter.io/microsoft.com',
        hq: 'Redmond, WA',
        locations: ['Hyderabad', 'Bangalore', 'Noida'],
        category: 'Global Big Tech & AI Labs',
        hiringSeasons: 'Fall (Aug-Oct)',
        hiringType: 'University Recruiting',
        hiringZone: 'on-campus',
        roles: ['SDE', 'Product Manager', 'Data Scientist'],
        difficulty: 'Hard',
        difficultyLevel: 4,
        roundsCount: 4,
        eligibility: {
            academic: "Degree in CS, IT or related fields",
            qualification: "B.Tech/M.Tech",
            backlogs: "No active backlogs"
        },
        selectionProcess: [
            { name: 'Online Assessment', details: '3 DSA questions (Medium) on Codility.' },
            { name: 'Technical Rounds', details: '3 sessions focusing on DSA, OS, and LLD.' },
            { name: 'As-Appropriate', details: 'Final bar-raising round for culture and fit.' }
        ],
                                        testPattern: [
            {
                section: 'Written Test - Coding Round 1',
                questions: '1 Qs',
                duration: '60 mins'
            },
            {
                section: 'Coding - Coding Round 2',
                questions: '2 Qs',
                duration: '60 mins'
            },
            {
                section: 'Interviews',
                questions: '-',
                duration: '-'
            },
        ],
                                        syllabus: [
        {
            round: 'Coding Topics',
            topics: [
                {
                    name: 'C',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'C++',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'OOPS Concepts',
                    questions: '1 or 2',
                    duration: '2 mins',
                    difficulty: 'High'
                },
                {
                    name: 'Basics of data structures',
                    questions: '1 or 2',
                    duration: '2 mins',
                    difficulty: 'High'
                },
                {
                    name: 'Networking',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Windows ad',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Exchange servers',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'DNS',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'DHCP',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'DBMS',
                    questions: '1 or 2',
                    duration: '2 mins',
                    difficulty: 'High'
                },
                {
                    name: 'Pointers',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Arrays',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Threads',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Classes',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Inheritance',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Preprocessors',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'C Datatypes',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Written Test - Coding Round 1',
            topics: [
                'Total Questions: 1 Qs',
                'Duration: 60 mins',
            ]
        },
        {
            round: 'Coding - Coding Round 2',
            topics: [
                'Total Questions: 2 Qs',
                'Duration: 60 mins',
            ]
        },
        {
            round: 'Interviews',
            topics: [
                'Details: 2 Technical Rounds, 1 HR Round',
            ]
        },
    ],
        registrationProcess: [
            'Apply via Microsoft University portal',
            'Submit updated resume with projects',
            'Complete Codility assessment',
            'Virtual interview loops'
        ],
        compensation: {
            base: '₹18L - ₹22L',
            bonus: '₹2L - ₹4L',
            stock: '₹20L - ₹30L over 4 years',
            relocation: '₹1.5L',
            totalYear1: '₹40L - ₹50L+'
        },
        prepFocus: 'Focus on OS, DBMS, and medium LeetCode. High emphasis on cultural fit.',
        insiderScoop: 'Microsoft loves well-rounded candidates. Don\'t just focus on code; focus on your projects and passion.',
        jobsLink: '/jobs?company=Microsoft'
    },
    {
        id: 'amazon',
        slug: 'amazon',
        name: 'Amazon',
        industry: 'E-commerce',
        logo: 'https://logos.hunter.io/amazon.com',
        hq: 'Seattle, WA',
        locations: ['Bangalore', 'Chennai', 'Hyderabad'],
        category: 'Global Big Tech & AI Labs',
        hiringSeasons: 'Year-round',
        hiringType: 'Mass University Hiring',
        hiringZone: 'off-campus',
        roles: ['SDE-1', 'Operations Manager'],
        difficulty: 'Medium',
        difficultyLevel: 3,
        roundsCount: 3,
        eligibility: {
            academic: "Strong academic record",
            qualification: "Graduates from any branch (CS/IT preferred)"
        },
        selectionProcess: [
            { name: 'OA 1 & 2', details: 'DSA + Simulation + Leadership Principles.' },
            { name: 'Technical Loop', details: '1-3 rounds of DSA + LP questions.' },
            { name: 'Bar Raiser', details: 'A final assessment to ensure high talent standards.' }
        ],
        testPattern: [
            { section: 'Coding', questions: '2 Qs', duration: '70 mins' },
            { section: 'Work Simulation', questions: 'Situational', duration: '20 mins' }
        ],
        syllabus: [
            { round: 'DSA', topics: ['Trees', 'Graphs', 'Tries', 'Dynamic Programming', 'Matrices'] },
            { round: 'Leadership', topics: ['16 Leadership Principles (LP)', 'STAR method'] }
        ],
        registrationProcess: [
            'Search for SDE-1 roles on Amazon Jobs',
            'Submit application and complete OAs',
            'Schedule interview loop'
        ],
        compensation: {
            base: '₹18L - ₹22L',
            bonus: '₹4L - ₹6L',
            stock: 'RSUs (Back-heavy vesting)',
            relocation: '₹1.5L',
            totalYear1: '₹30L - ₹45L'
        },
        prepFocus: 'LEADERSHIP PRINCIPLES. 50% of your interview is based on LPs.',
        insiderScoop: 'Learn the STAR method for behavioral questions. They care about LPs as much as your code.',
        jobsLink: '/jobs?company=Amazon'
    },
    {
        id: 'apple',
        slug: 'apple',
        name: 'Apple',
        industry: 'Tech',
        logo: 'https://logos.hunter.io/apple.com',
        hq: 'Cupertino, CA',
        locations: ['Hyderabad', 'Bangalore'],
        category: 'Global Big Tech & AI Labs',
        hiringSeasons: 'Early Fall',
        hiringType: 'University Hiring',
        hiringZone: 'off-campus',
        roles: ['SDE', 'Hardware Engineer'],
        difficulty: 'Hard',
        difficultyLevel: 5,
        roundsCount: 5,
        eligibility: {
            academic: "Degree in CS, EE or related technical field",
            qualification: "B.Tech, M.Tech, PhD",
            experience: "Strong portfolio of technical projects"
        },
        selectionProcess: [
            { name: 'Technical Assessment', details: 'Coding challenges (HackerRank) focusing on DSA.' },
            { name: 'Phone Screen', details: 'Initial deep dive into domain-specific knowledge.' },
            { name: 'Interview Loop', details: '4-8 rounds of intense technical and behavioral deep dives.' }
        ],
        testPattern: [
            { section: 'Coding', questions: '2 Qs', duration: '60 mins' },
            { section: 'Domain MCQ', questions: 'Optional', duration: 'Varies' }
        ],
        syllabus: [
            { round: 'Core CS', topics: ['Operating Systems', 'Computer Networks', 'Memory Management', 'DSA'] },
            { round: 'Behavioral', topics: ['STAR Method', 'Apple Philosophy', 'Privacy & Craftsmanship'] }
        ],
        registrationProcess: [
            'Apply via Apple Careers portal',
            'Tailor resume for specific team focus',
            'Participate in recruiter outreach calls',
            'Prepare project deep dives'
        ],
        compensation: {
            base: '₹18L - ₹24L',
            bonus: '10%',
            stock: '₹20L - ₹30L',
            relocation: '₹2L',
            totalYear1: '₹25L - ₹32L'
        },
        prepFocus: 'Focus on Low-level programming, Memory management, and OS internals.',
        insiderScoop: 'Apple values "work over degrees." One perfect project is better than ten average ones.',
        jobsLink: '/jobs?company=Apple'
    },
    {
        id: 'accenture',
        slug: 'accenture',
        name: 'Accenture',
        industry: 'Consulting',
        logo: 'https://logos.hunter.io/accenture.com',
        hq: 'Dublin, Ireland',
        locations: ['Across India'],
        category: 'Major IT Services & Consulting',
        hiringSeasons: 'Aug-Dec',
        hiringType: 'Campus Recruitment',
        hiringZone: 'on-campus',
        coverImage: '/accenture_office.png',
        roles: ['ASE', 'SADA', 'Advanced ASE'],
        difficulty: 'Medium',
        difficultyLevel: 3,
        roundsCount: 4,
        eligibility: {
            academic: "60% or 6.5 CGPA throughout",
            qualification: "BE/B.Tech, ME/M.Tech, MCA, M.Sc (CS/IT)",
            gapInEducation: "Max 1 year",
            backlogs: "No active backlogs"
        },
        selectionProcess: [
            { name: 'Cognitive & Technical', details: '90 Qs elimination round.' },
            { name: 'Coding Assessment', details: '2 Questions in 45 mins.' },
            { name: 'Communication Assessment', details: 'Aura/speaking assessment.' },
            { name: 'Interview', details: 'Technical + HR interview.' }
        ],
                                        testPattern: [
            {
                section: '1st Round - Behavioral Assessment (Psychometric)',
                questions: '54 Qs',
                duration: '20 mins'
            },
            {
                section: '1st Round - Cognitive Assessment (Gamified)',
                questions: '3 Qs',
                duration: '20 mins'
            },
            {
                section: '2nd Round - Technical Assessment (MCQs)',
                questions: '45 Qs',
                duration: '45 mins'
            },
            {
                section: '2nd Round - Coding Assessment',
                questions: '3 Qs',
                duration: '60 mins'
            },
            {
                section: '3rd Round - Communication Assessment',
                questions: '20-25 (approx.)',
                duration: '30 mins'
            },
        ],
                                        syllabus: [
        {
            round: 'Technical Assessment',
            topics: [
                {
                    name: 'Fundamentals of Networking, Security, and Cloud',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Common Applications and MS Office',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Pseudo Code',
                    questions: '1 or 2',
                    duration: '2 mins',
                    difficulty: 'High'
                },
            ]
        },
        {
            round: 'Verbal Ability',
            topics: [
                {
                    name: 'Sentence Correction',
                    questions: '1-2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Preposition',
                    questions: '1-2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Grammar',
                    questions: '0-3',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Reading Comprehension',
                    questions: '1-2',
                    duration: '3 mins',
                    difficulty: 'Medium'
                },
                {
                    name: 'Synonym and Antonyms',
                    questions: '0-4',
                    duration: '30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Idioms and Phrases',
                    questions: '1-2',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Speech and Voices',
                    questions: '1-2',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Article',
                    questions: '1-2',
                    duration: '1 min',
                    difficulty: 'High'
                },
                {
                    name: 'Sentence Selection',
                    questions: '1-2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Spotting Error',
                    questions: '1-2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Sentence Arrangement',
                    questions: '1-2',
                    duration: '45 secs',
                    difficulty: 'High'
                },
            ]
        },
        {
            round: 'Critical Reasoning And Logical',
            topics: [
                {
                    name: 'Arrangements',
                    questions: '1-2',
                    duration: '1 min 30 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Visual Reasoning',
                    questions: '0-1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Blood Relations',
                    questions: '1-2',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Flow chart',
                    questions: '1-2',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Statement and Conclusion',
                    questions: '1-2',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Coding-Decoding',
                    questions: '1-2',
                    duration: '2 mins',
                    difficulty: 'Medium'
                },
                {
                    name: 'Psychometric',
                    questions: '1-2',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Directional Sense',
                    questions: '1-2',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Analogies',
                    questions: '1-2',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Seating Arrangement',
                    questions: '1-2',
                    duration: '1 min 30 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Inferred Meaning',
                    questions: '1-2',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Logical Sequence',
                    questions: '1-2',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Coding',
            topics: [
                'Total Questions: 3',
                'Duration: 60 minutes',
                'Languages Allowed: C, C++, Java, JavaScript, Python, Dot Net, HTML/CSS',
                'Selection Criteria: 2 Complete Output and 1 Partial Output',
                'Negative Marking: No',
                'Rule: Start code from scratch.',
                'Rule: Errors are clearly mentioned.',
                'Rule: Write the whole program.',
            ]
        },
        {
            round: '1st Round - Behavioral Assessment (Psychometric)',
            topics: [
                'Total Questions: 54 Qs',
                'Duration: 20 mins',
            ]
        },
        {
            round: '1st Round - Cognitive Assessment (Gamified)',
            topics: [
                'Total Questions: 3 Qs',
                'Duration: 20 mins',
            ]
        },
        {
            round: '3rd Round - Communication Assessment',
            topics: [
                'Total Questions: 20-25 (approx.)',
                'Duration: 30 mins',
            ]
        },
    ],
        registrationProcess: [
            'Visit Accenture India Campus portal',
            'Register and choose role (ASE/Advanced ASE)',
            'Upload Resume and ID documents',
            'Submit application'
        ],
        compensation: {
            base: '₹4.5L - ₹6.5L',
            bonus: 'N/A',
            stock: 'N/A',
            relocation: 'Variable',
            totalYear1: '₹5L - ₹8L'
        },
        prepFocus: 'Focus on communication and basic programming. Pseudo-code round is an elimination round.',
        insiderScoop: 'A great place to start your career. The Communication round evaluates your fluency and confidence.',
        jobsLink: '/jobs?company=Accenture'
    },
    {
        id: 'ibm',
        slug: 'ibm',
        name: 'IBM',
        industry: 'Tech',
        logo: 'https://logos.hunter.io/ibm.com',
        hq: 'Armonk, NY',
        locations: ['Bangalore', 'Pune', 'Kochi', 'Hyderabad', 'Chennai'],
        category: 'Major IT Services & Consulting',
        hiringSeasons: 'Year-round',
        hiringType: 'Off-Campus / Campus',
        hiringZone: 'on-campus',
        coverImage: '/ibm_office.png',
        roles: ['Associate System Engineer', 'Data Scientist', 'Cloud Engineer'],
        difficulty: 'Medium',
        difficultyLevel: 3,
        roundsCount: 3,
        eligibility: {
            academic: "60% or 6.0 CGPA throughout (X, XII, Grad)",
            qualification: "BE/B.Tech, ME/M.Tech, MCA, M.Sc",
            backlogs: "No active backlogs",
            gapInEducation: "Max 1 year"
        },
        selectionProcess: [
            { name: 'Online Assessment', details: 'Coding (HackerRank) + English Assessment.' },
            { name: 'Group Discussion', details: 'Optional round for some campus drives.' },
            { name: 'Interview', details: 'Technical + HR Combined Round.' }
        ],
                                        testPattern: [
            {
                section: 'Round 1: Online Coding + English Test - Coding Test',
                questions: '2 Qs',
                duration: 'Approx. 60 Minutes'
            },
            {
                section: 'Round 1: Online Coding + English Test - English Language Test',
                questions: '10 Qs',
                duration: '10 Min'
            },
            {
                section: 'Round 2: Group Discussion Round',
                questions: '-',
                duration: '-'
            },
            {
                section: 'Round 3: Interview (HR + Technical)',
                questions: '-',
                duration: '-'
            },
        ],
                                        syllabus: [
        {
            round: 'Round 1: Online Coding + English Test - Coding Test',
            topics: [
                'Total Questions: 2 Qs',
                'Duration: Approx. 60 Minutes',
                'Details: Conducted on HackerRank. Includes String/Array based coding and 5-6 MCQs on DBMS, OS, OOPS, Programming.',
            ]
        },
        {
            round: 'Round 1: Online Coding + English Test - English Language Test',
            topics: [
                'Total Questions: 10 Qs',
                'Duration: 10 Min',
                'Active/Passive Voice',
                'Fill in The Blanks',
                'Spotting Error',
                'Spelling',
                'Synonyms',
                'Antonyms',
                'Preposition and Conjunctions',
                'Tenses and Articles',
            ]
        },
        {
            round: 'Round 2: Group Discussion Round',
            topics: []
        },
        {
            round: 'Round 3: Interview (HR + Technical)',
            topics: []
        },
    ],
        registrationProcess: [
            'Visit IBM Careers portal',
            'Register and create an IBMid',
            'Search for "Associate System Engineer" roles',
            'Complete application and upload documents'
        ],
        compensation: {
            base: '₹4.5L - ₹12L',
            bonus: 'N/A',
            stock: 'N/A',
            relocation: '₹50k',
            totalYear1: '₹5L - ₹13L'
        },
        prepFocus: 'Strong fundamentals in Cloud, AI, and SQL are highly valued.',
        insiderScoop: 'IBM values long-term thinkers. Be ready for a deep dive into your projects and your motivation for joining IBM.',
        jobsLink: '/jobs?company=IBM'
    },
    {
        id: 'hcl',
        slug: 'hcl',
        name: 'HCL Technologies',
        industry: 'IT Services',
        logo: 'https://logos.hunter.io/hcltech.com',
        hq: 'Noida, India',
        locations: ['Noida', 'Bangalore', 'Chennai', 'Hyderabad'],
        category: 'Major IT Services & Consulting',
        hiringSeasons: 'Mass Recruitment (July-Dec)',
        hiringType: 'Campus / Off-Campus',
        hiringZone: 'on-campus',
        coverImage: '/hcl_office.png',
        roles: ['Graduate Engineer Trainee', 'Software Engineer'],
        difficulty: 'Easy',
        difficultyLevel: 2,
        roundsCount: 3,
        eligibility: {
            academic: "60% or 6.0 CGPA throughout",
            qualification: "BE/B.Tech, ME/M.Tech, MCA",
            backlogs: "No active backlogs",
            gapInEducation: "Max 1 year"
        },
        selectionProcess: [
            { name: 'Online Assessment', details: 'Aptitude + Technical MCQs.' },
            { name: 'Technical Interview', details: 'Core CS subjects and Coding basics.' },
            { name: 'HR Interview', details: 'Communication and behavioral fit.' }
        ],
                                        testPattern: [
            {
                section: 'Aptitude (Numerical Ability)',
                questions: '15 Qs',
                duration: '15 mins'
            },
            {
                section: 'Logical Reasoning',
                questions: '15 Qs',
                duration: '15 mins'
            },
            {
                section: 'Verbal Ability',
                questions: '15 Qs',
                duration: '15 mins'
            },
            {
                section: 'Computer Fundamentals',
                questions: '30 Qs',
                duration: '30 mins'
            },
            {
                section: 'Coding',
                questions: '2 Qs',
                duration: '20 mins'
            },
        ],
                                        syllabus: [
        {
            round: 'Numerical Ability',
            topics: [
                {
                    name: 'HCF and LCM',
                    questions: '1-2',
                    duration: '1 min 10 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Number System',
                    questions: '1-2',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Time, Work, Pipes and Cisterns',
                    questions: '0-2',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Permutations and Combinations',
                    questions: '1-2',
                    duration: '1 min 10 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Geometry',
                    questions: '0-1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Time, Speed and Distance',
                    questions: '1-2',
                    duration: '1 min 25 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Probability',
                    questions: '0-1',
                    duration: '1 min 25 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Profit and Loss',
                    questions: '0-1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Interest, Mixture and Allegation',
                    questions: '0-1',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Logarithm',
                    questions: '0-1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
            ]
        },
        {
            round: 'Verbal Ability',
            topics: [
                {
                    name: 'Sentence correction',
                    questions: '1-3',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Reading Comprehension',
                    questions: '1-3',
                    duration: '3 mins',
                    difficulty: 'Medium'
                },
                {
                    name: 'Grammar',
                    questions: '1-2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Synonyms and Antonyms',
                    questions: '1-3',
                    duration: '30 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Fill in the blanks',
                    questions: '1-2',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Spellings',
                    questions: '1-3',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Logical Reasoning',
            topics: [
                {
                    name: 'Directional Sense',
                    questions: '1-2',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Logical Reasoning',
                    questions: '1-2',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Coding and Decoding',
                    questions: '0-3',
                    duration: '2 mins',
                    difficulty: 'Medium'
                },
                {
                    name: 'Data Sufficiency',
                    questions: '1-2',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Pattern Analogy',
                    questions: '0-2',
                    duration: '30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Number Series',
                    questions: '1-2',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Logical Statement Assumption',
                    questions: '1-2',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Computer Fundamentals',
            topics: [
                {
                    name: 'Computer Basics',
                    questions: '1-5',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Data Structures',
                    questions: '1-4',
                    duration: '2 mins',
                    difficulty: 'Medium'
                },
                {
                    name: 'OOPs',
                    questions: '1-4',
                    duration: '2 mins',
                    difficulty: 'Medium'
                },
                {
                    name: 'Code input Output',
                    questions: '1-4',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Networking',
                    questions: '1-4',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'OS',
                    questions: '1-5',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'DBMS',
                    questions: '1-4',
                    duration: '2 mins',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Coding',
            topics: [
                'Total Questions: 2 Qs',
                'Duration: 20 mins',
            ]
        },
    ],
        registrationProcess: [
            'Visit HCLTech Careers portal',
            'Register to generate Candidate ID',
            'Fill detailed application form',
            'Wait for test invitation'
        ],
        compensation: {
            base: '₹3.5L - ₹5L',
            bonus: 'N/A',
            stock: 'N/A',
            relocation: 'Variable',
            totalYear1: '₹4L - ₹6L'
        },
        prepFocus: 'Focus on aptitude and pseudocode. Strong communication is key for the final interview.',
        insiderScoop: 'A stable company with great learning opportunities for freshers. The pseudocode round is where most people struggle.',
        jobsLink: '/jobs?company=HCL'
    },
    {
        id: 'ltimindtree',
        slug: 'lti-mindtree',
        name: 'LTI Mindtree',
        industry: 'IT Services',
        logo: 'https://logos.hunter.io/ltimindtree.com',
        hq: 'Mumbai, India',
        locations: ['Mumbai', 'Bangalore', 'Pune', 'Hyderabad'],
        category: 'Major IT Services & Consulting',
        hiringSeasons: 'Aug-Oct',
        hiringType: 'Campus Recruitment',
        hiringZone: 'on-campus',
        roles: ['GET (Graduate Engineer Trainee)'],
        difficulty: 'Medium',
        difficultyLevel: 3,
        roundsCount: 3,
        eligibility: {
            academic: "60% or 6.0 CGPA throughout",
            qualification: "BE/B.Tech, ME/M.Tech, MCA",
            backlogs: "No active backlogs",
            gapInEducation: "Max 2 years"
        },
        selectionProcess: [
            { name: 'Online Assessment', details: 'Aptitude + Technical + Communication.' },
            { name: 'Technical Interview', details: 'Focus on projects and CS fundamentals.' },
            { name: 'HR Interview', details: 'Behavioral and relocation check.' }
        ],
                                        testPattern: [
            {
                section: 'Round 1: Online Assessment - English Comprehension',
                questions: '12 (3-4 Passages)',
                duration: '15 mins'
            },
            {
                section: 'Round 1: Online Assessment - Quantitative Ability',
                questions: '12 Qs',
                duration: '15 mins'
            },
            {
                section: 'Round 1: Online Assessment - Logical Reasoning',
                questions: '12 Qs',
                duration: '15 mins'
            },
            {
                section: 'Round 1: Online Assessment - Basic Analytical Ability',
                questions: '10 Qs',
                duration: '10 mins'
            },
            {
                section: 'Round 1: Online Assessment - Computer Science (Programming/Fundamentals)',
                questions: '20 Qs',
                duration: '20 mins'
            },
            {
                section: 'Round 1: Online Assessment - Spoken English',
                questions: '20 Qs',
                duration: '20 mins'
            },
            {
                section: 'Round 2: Technical Interview',
                questions: '-',
                duration: '-'
            },
            {
                section: 'Round 3: HR Interview',
                questions: '-',
                duration: '-'
            },
        ],
                                        syllabus: [
        {
            round: 'Quantitative Ability',
            topics: [
                {
                    name: 'LCM & HCF',
                    questions: '0 or 1',
                    duration: '1 min 10 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Divisibility',
                    questions: '1 or 2',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Number Decimal, fraction & power',
                    questions: '0 or 1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Time & Work',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Pipes & Cistern',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Averages',
                    questions: '0 or 1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Profit & Loss',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Simple & Compound Interest',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Time, Speed & Distance',
                    questions: '1',
                    duration: '1 min 25 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Inverse',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Ratio & Proportion',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Algebra',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Surds & Indices',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Logarithms',
                    questions: '1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Permutations & Combinations',
                    questions: '1',
                    duration: '1 min 10 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Probability',
                    questions: '0 or 1',
                    duration: '1 min 25 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Area, Shapes & Perimeter',
                    questions: '0 or 1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Percentages',
                    questions: '0 or 1',
                    duration: '2 mins',
                    difficulty: 'Medium'
                },
                {
                    name: 'Boats and Streams',
                    questions: '1',
                    duration: '1 min 25 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Clocks and Calendars',
                    questions: '0 or 1',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Logical Reasoning',
            topics: [
                {
                    name: 'Blood Relation',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Directional Sense',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Analogy and Classification pattern recognition',
                    questions: '1 or 2',
                    duration: '30 secs',
                    difficulty: 'Easy'
                },
                {
                    name: 'Odd Man Out',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Statement & Conclusion',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Seating Arrangement',
                    questions: '1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Logical word sequence',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Inferred Meaning',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Basic Analytical Ability',
            topics: [
                {
                    name: 'Coding deductive logic',
                    questions: '1 or 2',
                    duration: '2 mins',
                    difficulty: 'High'
                },
                {
                    name: 'Objective Reasoning',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Selection decision tables',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Coding pattern and Number series pattern recognition',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Data sufficiency',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Mathematical Order',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Computer Science',
            topics: [
                {
                    name: 'Basic Programming',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Data Structures',
                    questions: '1 or 2',
                    duration: '2 mins',
                    difficulty: 'High'
                },
                {
                    name: 'OOPs',
                    questions: '1 or 2',
                    duration: '2 mins',
                    difficulty: 'High'
                },
                {
                    name: 'Psuedo Code',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'DBMS',
                    questions: '1 or 2',
                    duration: '2 mins',
                    difficulty: 'High'
                },
                {
                    name: 'Operating Systems',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Computer Networks',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
            ]
        },
        {
            round: 'Spoken English',
            topics: [
                {
                    name: 'Making correct and meaningful sentences',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Subject-verb agreement',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Proper use of tenses',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Articles and prepositions',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Conjunctions and connectors',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Pronouns and modifiers',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Converting direct speech to indirect speech',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Round 1: Online Assessment - English Comprehension',
            topics: [
                'Total Questions: 12 (3-4 Passages)',
                'Duration: 15 mins',
            ]
        },
        {
            round: 'Round 2: Technical Interview',
            topics: []
        },
        {
            round: 'Round 3: HR Interview',
            topics: []
        },
    ],
        registrationProcess: [
            'Visit LTIMindtree career portal',
            'Register for freshers drive',
            'Submit resume and academic details',
            'Complete the online assessment link'
        ],
        compensation: {
            base: '₹4L - ₹6L',
            bonus: 'N/A',
            stock: 'N/A',
            relocation: 'Full support',
            totalYear1: '₹4.5L - ₹7L'
        },
        prepFocus: 'SQL queries are frequently asked. Brush up on OOPS and DBMS thoroughly.',
        insiderScoop: 'They value candidates who are strong in database concepts. Communication assessment is mandatory but non-elimination in some drives.',
        jobsLink: '/jobs?company=LTI'
    },
    {
        id: 'hexaware',
        slug: 'hexaware',
        name: 'Hexaware',
        industry: 'IT Services',
        logo: 'https://logos.hunter.io/hexaware.com',
        hq: 'Navi Mumbai, India',
        locations: ['Navi Mumbai', 'Bangalore', 'Chennai', 'Pune'],
        category: 'Major IT Services & Consulting',
        hiringSeasons: 'Aug-Nov',
        hiringType: 'Campus Recruitment (GET/PGET)',
        hiringZone: 'on-campus',
        roles: ['GET', 'PGET (Premier GET)'],
        difficulty: 'Medium',
        difficultyLevel: 3,
        roundsCount: 4,
        eligibility: {
            academic: "60% or 6.0 CGPA throughout",
            qualification: "BE/B.Tech, MCA, M.Sc (CS/IT)",
            backlogs: "No active backlogs",
            gapInEducation: "Max 1 year"
        },
        selectionProcess: [
            { name: 'Online Aptitude + Domain', details: '90 mins screening round.' },
            { name: 'Coding Test (PGET Only)', details: '2 DSA problems (45-60 mins).' },
            { name: 'Communication Assessment', details: 'SpeechX AI-based round.' },
            { name: 'Interviews', details: 'Technical and HR rounds.' }
        ],
                                        testPattern: [
            {
                section: 'GET - Round 1: Aptitude Test + Domain based - Verbal Ability',
                questions: '20 Qs',
                duration: 'Shared within 60 mins'
            },
            {
                section: 'GET - Round 1: Aptitude Test + Domain based - Logical Ability',
                questions: '20 Qs',
                duration: 'Shared within 60 mins'
            },
            {
                section: 'GET - Round 1: Aptitude Test + Domain based - Numerical Ability',
                questions: '20 Qs',
                duration: 'Shared within 60 mins'
            },
            {
                section: 'GET - Round 1: Aptitude Test + Domain based - Domain-based',
                questions: '30 Qs',
                duration: '30 mins'
            },
            {
                section: 'GET - Round 2: Communication Assessment',
                questions: '-',
                duration: '-'
            },
            {
                section: 'GET - Round 3: Technical Interview',
                questions: '-',
                duration: '-'
            },
            {
                section: 'GET - Round 4: HR Interview',
                questions: '-',
                duration: '-'
            },
            {
                section: 'GET - Round 1: Aptitude Test + Domain based - Verbal Ability',
                questions: '20 Qs',
                duration: '-'
            },
            {
                section: 'GET - Round 1: Aptitude Test + Domain based - Logical Ability',
                questions: '20 Qs',
                duration: '-'
            },
            {
                section: 'GET - Round 1: Aptitude Test + Domain based - Numerical Ability',
                questions: '20 Qs',
                duration: '-'
            },
            {
                section: 'GET - Round 1: Aptitude Test + Domain based - Domain-based',
                questions: '30 Qs',
                duration: '-'
            },
            {
                section: 'GET - Round 2: Coding Test',
                questions: '2 Qs',
                duration: '60 mins'
            },
            {
                section: 'GET - Round 3: Communication Assessment',
                questions: '-',
                duration: '-'
            },
            {
                section: 'GET - Round 4: Technical Interview',
                questions: '-',
                duration: '-'
            },
            {
                section: 'GET - Round 5: HR Interview',
                questions: '-',
                duration: '-'
            },
        ],
                                        syllabus: [
        {
            round: 'Numerical Ability',
            topics: [
                {
                    name: 'LCM and HCF',
                    questions: '0 or 1',
                    duration: '1 min 10 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Percentages',
                    questions: '0 or 1',
                    duration: '2 mins',
                    difficulty: 'Medium'
                },
                {
                    name: 'Ranking based',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Ratio and Proportions',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Ages',
                    questions: '0 or 1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Speed Time and Distance',
                    questions: '1',
                    duration: '1 min 25 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Probability',
                    questions: '0 or 1',
                    duration: '1 min 25 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Profit and Loss',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Time and Work',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Bar Graph',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Line Graph',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Pie chart',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Tabular DI',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Logical Reasoning',
            topics: [
                {
                    name: 'Syllogism',
                    questions: '1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Arrangements',
                    questions: '1',
                    duration: '1 min 30 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Letter Series',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Coding and decoding',
                    questions: '1 or 2',
                    duration: '2 mins',
                    difficulty: 'High'
                },
                {
                    name: 'Ranking and Sequence',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Blood relations',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Relationship b/w words',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Visual reasoning',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Odd one out',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Statements and Conclusions',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Statements and Arguments',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Verbal Ability',
            topics: [
                {
                    name: 'Preposition and Conjunction',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Idioms and phrases',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Fill in the blanks',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Spelling',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Analogy',
                    questions: '1 or 2',
                    duration: '30 secs',
                    difficulty: 'Easy'
                },
                {
                    name: 'One word Substitution',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Synonyms and Antonyms',
                    questions: '1 or 2',
                    duration: '30 secs',
                    difficulty: 'Easy'
                },
                {
                    name: 'Sentence improvement',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Reading Comprehension',
                    questions: '1',
                    duration: '3 mins',
                    difficulty: 'High'
                },
                {
                    name: 'Articles',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Speech and Tense',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Sentence Ordering',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Error Identification',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Domain Based',
            topics: [
                {
                    name: 'Pseudocode',
                    questions: '1 or 2',
                    duration: '2 mins',
                    difficulty: 'High'
                },
                {
                    name: 'Computer Fundamentals',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'GET - Round 2: Communication Assessment',
            topics: []
        },
        {
            round: 'GET - Round 3: Technical Interview',
            topics: []
        },
        {
            round: 'GET - Round 4: HR Interview',
            topics: []
        },
        {
            round: 'GET - Round 2: Coding Test',
            topics: [
                'Total Questions: 2 Qs',
                'Duration: 60 mins',
                'Languages Allowed: C, C++, Java, Python',
            ]
        },
        {
            round: 'GET - Round 3: Communication Assessment',
            topics: []
        },
        {
            round: 'GET - Round 4: Technical Interview',
            topics: []
        },
        {
            round: 'GET - Round 5: HR Interview',
            topics: []
        },
    ],
        registrationProcess: [
            'Register on Superset portal for Hexaware',
            'Complete your profile and upload resume',
            'Apply for GET/PGET roles',
            'Take the initial screening assessment'
        ],
        compensation: {
            base: '₹4L - ₹7L',
            bonus: 'N/A',
            stock: 'N/A',
            relocation: 'Relocation assistance',
            totalYear1: '₹4.5L - ₹8L'
        },
        prepFocus: 'Pseudocode and basic programming logic are high-weightage.',
        insiderScoop: 'The PGET role offers a significantly higher package but requires clearing the coding round. Practice loops and recursion.',
        jobsLink: '/jobs?company=Hexaware'
    },
    {
        id: 'razorpay',
        slug: 'razorpay',
        name: 'Razorpay',
        industry: 'Fintech',
        logo: 'https://logos.hunter.io/razorpay.com',
        hq: 'Bangalore, India',
        locations: ['Bangalore'],
        category: 'Top Product & Fintech (India)',
        hiringSeasons: 'Aug-Nov',
        hiringType: 'Campus / Off-Campus',
        hiringZone: 'on-campus',
        roles: ['SDE-1', 'Frontend Engineer'],
        difficulty: 'Hard',
        difficultyLevel: 4,
        roundsCount: 4,
        process: [
            { name: 'Online Test', details: 'DSA + LLD.' },
            { name: 'Technical 1', details: 'Problem Solving (Medium/Hard).' },
            { name: 'Technical 2', details: 'Product Design / Architecture.' }
        ],
                testPattern: [
            {
                section: 'Coding',
                questions: '3 Qs',
                duration: '90 mins'
            },
            {
                section: 'Aptitude & MCQs',
                questions: '20 Qs',
                duration: '30 mins'
            }
        ],
        syllabus: [
            {
                round: 'Coding',
                topics: [
                    { name: 'Dynamic Programming', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Graphs', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Trees & Arrays', questions: '1', duration: '30 mins', difficulty: 'Medium' }
                ]
            },
            {
                round: 'CS Fundamentals & MCQs',
                topics: [
                    { name: 'OS & DBMS', questions: '10', duration: '15 mins', difficulty: 'Medium' },
                    { name: 'Computer Networks', questions: '5', duration: '10 mins', difficulty: 'Medium' },
                    { name: 'Aptitude', questions: '5', duration: '5 mins', difficulty: 'Easy' }
                ]
            }
        ],
        registrationProcess: [
            'Visit the company Careers page',
            'Apply through the Campus drive or referral link',
            'Shortlisted candidates receive test link'
        ],
compensation: {
            base: '₹20L - ₹24L',
            bonus: '₹2L - ₹4L',
            stock: 'ESOPs',
            relocation: '₹1L',
            totalYear1: '₹25L - ₹35L'
        },
        prepFocus: 'Focus on System Design and Backend architecture. They value "product thinking".',
        insiderScoop: 'Razorpay has an elite tech culture. Be ready for deep technical discussions on how you\'d build a payment gateway.',
        jobsLink: '/jobs?company=Razorpay'
    },
    {
        id: 'phonepe',
        slug: 'phonepe',
        name: 'PhonePe',
        industry: 'Fintech',
        logo: 'https://logos.hunter.io/phonepe.com',
        hq: 'Bangalore, India',
        locations: ['Bangalore', 'Pune'],
        category: 'Top Product & Fintech (India)',
        hiringSeasons: 'Fall',
        hiringType: 'University Hiring',
        hiringZone: 'on-campus',
        roles: ['SDE-1'],
        difficulty: 'Hard',
        difficultyLevel: 5,
        roundsCount: 4,
        process: [
            { name: 'Online Test', details: 'Difficult DSA questions.' },
            { name: 'Technical 1', details: 'DSA (Hard).' },
            { name: 'Technical 2', details: 'System Design / High-level design.' }
        ],
                testPattern: [
            {
                section: 'Coding',
                questions: '3 Qs',
                duration: '90 mins'
            },
            {
                section: 'Aptitude & MCQs',
                questions: '20 Qs',
                duration: '30 mins'
            }
        ],
        syllabus: [
            {
                round: 'Coding',
                topics: [
                    { name: 'Dynamic Programming', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Graphs', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Trees & Arrays', questions: '1', duration: '30 mins', difficulty: 'Medium' }
                ]
            },
            {
                round: 'CS Fundamentals & MCQs',
                topics: [
                    { name: 'OS & DBMS', questions: '10', duration: '15 mins', difficulty: 'Medium' },
                    { name: 'Computer Networks', questions: '5', duration: '10 mins', difficulty: 'Medium' },
                    { name: 'Aptitude', questions: '5', duration: '5 mins', difficulty: 'Easy' }
                ]
            }
        ],
        registrationProcess: [
            'Visit the company Careers page',
            'Apply through the Campus drive or referral link',
            'Shortlisted candidates receive test link'
        ],
compensation: {
            base: '₹20L - ₹26L',
            bonus: '₹3L - ₹5L',
            stock: 'ESOPs',
            relocation: '₹1L',
            totalYear1: '₹28L - ₹38L'
        },
        prepFocus: 'Very high focus on DSA. Solve LeetCode Hards.',
        insiderScoop: 'One of the hardest companies to crack in India. Their bar for SDE-1 is very high.',
        jobsLink: '/jobs?company=PhonePe'
    },
    {
        id: 'flipkart',
        slug: 'flipkart',
        name: 'Flipkart',
        industry: 'E-commerce',
        logo: 'https://logos.hunter.io/flipkart.com',
        hq: 'Bangalore, India',
        locations: ['Bangalore'],
        category: 'Top Product & Fintech (India)',
        hiringSeasons: 'Aug-Oct',
        hiringType: 'Campus / APM Program',
        hiringZone: 'on-campus',
        roles: ['SDE-1', 'APM'],
        difficulty: 'Hard',
        difficultyLevel: 4,
        roundsCount: 4,
        process: [
            { name: 'Online Test', details: 'DSA + MCQs.' },
            { name: 'Technical 1', details: 'DSA (Medium/Hard).' },
            { name: 'Technical 2', details: 'Machine Coding (LLD).' }
        ],
        testPattern: [
            {
                section: 'Coding',
                questions: '3 Qs',
                duration: '90 mins'
            },
            {
                section: 'Aptitude & MCQs',
                questions: '20 Qs',
                duration: '30 mins'
            }
        ],
        syllabus: [
            {
                round: 'Coding',
                topics: [
                    { name: 'Dynamic Programming', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Graphs', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Trees & Arrays', questions: '1', duration: '30 mins', difficulty: 'Medium' }
                ]
            },
            {
                round: 'CS Fundamentals & MCQs',
                topics: [
                    { name: 'OS & DBMS', questions: '10', duration: '15 mins', difficulty: 'Medium' },
                    { name: 'Computer Networks', questions: '5', duration: '10 mins', difficulty: 'Medium' },
                    { name: 'Aptitude', questions: '5', duration: '5 mins', difficulty: 'Easy' }
                ]
            }
        ],
        registrationProcess: [
            'Visit Flipkart Careers page',
            'Apply through the Campus drive or referral link',
            'Shortlisted candidates receive HackerRank test link'
        ],
        compensation: {
            base: '₹18L - ₹22L',
            bonus: '₹2L - ₹4L',
            stock: 'ESOPs',
            relocation: '₹1.5L',
            totalYear1: '₹26L - ₹32L'
        },
        prepFocus: 'Machine Coding is their signature round. Practice LLD of things like "Snake and Ladder" or "Parking Lot".',
        insiderScoop: 'The "Machine Coding" round is the dealbreaker. Speed and clean code are both required.',
        jobsLink: '/jobs?company=Flipkart'
    },
    {
        id: 'oracle',
        slug: 'oracle',
        name: 'Oracle',
        industry: 'Cloud/Database',
        logo: 'https://logos.hunter.io/oracle.com',
        hq: 'Austin, TX',
        locations: ['Bangalore', 'Hyderabad', 'Pune', 'Noida'],
        category: 'Global Big Tech & AI Labs',
        hiringSeasons: 'Aug-Oct',
        hiringType: 'University Hiring',
        hiringZone: 'on-campus',
        coverImage: '/oracle_office.png',
        roles: ['Member Technical Staff (MTS)', 'Cloud Engineer'],
        difficulty: 'Hard',
        difficultyLevel: 4,
        roundsCount: 4,
        eligibility: {
            academic: "Strong academic record (usually 7.0+ CGPA)",
            qualification: "B.Tech/M.Tech/MCA",
            backlogs: "No active backlogs"
        },
        selectionProcess: [
            { name: 'Online Assessment', details: 'Aptitude + Technical MCQs + Coding.' },
            { name: 'Technical Interview 1', details: 'Focus on DSA and core CS fundamentals.' },
            { name: 'Technical Interview 2', details: 'Deep dive into DBMS, SQL, and project work.' },
            { name: 'HR Interview', details: 'Cultural fit and behavioral assessment.' }
        ],
        testPattern: [
            { section: 'Aptitude/Logic', questions: '30 Qs', duration: '40 mins' },
            { section: 'Technical MCQ (SQL/OS)', questions: '20 Qs', duration: '20 mins' },
            { section: 'Coding', questions: '2 Qs', duration: '60 mins' }
        ],
        syllabus: [
            { round: 'Technical', topics: ['DBMS (Indexing, Normalization)', 'SQL Queries', 'OS', 'DSA'] },
            { round: 'Coding', topics: ['Trees', 'Graphs', 'Dynamic Programming', 'Linked Lists'] }
        ],
        registrationProcess: [
            'Apply via Oracle Careers portal',
            'Submit resume for MTS/Cloud roles',
            'Complete online assessments as invited',
            'Participate in virtual onsite rounds'
        ],
        compensation: {
            base: '₹15L - ₹20L',
            bonus: 'Variable',
            stock: 'RSUs',
            relocation: 'Full support',
            totalYear1: '₹18L - ₹28L'
        },
        prepFocus: 'High emphasis on DBMS and SQL. Be ready for complex database questions.',
        insiderScoop: 'Oracle values strong fundamentals. Don\'t just practice coding; make sure your SQL and OS concepts are rock solid.',
        jobsLink: '/jobs?company=Oracle'
    },
    {
        id: 'adobe',
        slug: 'adobe',
        name: 'Adobe',
        industry: 'Software',
        logo: 'https://logos.hunter.io/adobe.com',
        hq: 'San Jose, CA',
        locations: ['Noida', 'Bangalore'],
        category: 'Global Big Tech & AI Labs',
        hiringSeasons: 'Aug-Oct',
        hiringType: 'University Hiring',
        hiringZone: 'on-campus',
        coverImage: '/adobe_office.png',
        roles: ['SDE-1', 'Member Technical Staff'],
        difficulty: 'Hard',
        difficultyLevel: 5,
        roundsCount: 5,
        eligibility: {
            academic: "Excellent academic record",
            qualification: "B.Tech/M.Tech (CS/IT preferred)"
        },
        selectionProcess: [
            { name: 'Online Assessment', details: 'Technical challenge on HackerRank.' },
            { name: 'Technical Interviews', details: '3-4 rounds of coding and system design basics.' },
            { name: 'HR Interview', details: 'Behavioral and values alignment.' }
        ],
        testPattern: [
            { section: 'Technical MCQ', questions: '20 Qs', duration: '30 mins' },
            { section: 'Coding', questions: '2-3 Qs', duration: '90 mins' }
        ],
        syllabus: [
            { round: 'Technical', topics: ['Strings', 'Arrays', 'Graphs', 'Heaps', 'OS Fundamentals'] },
            { round: 'Design', topics: ['OOD', 'Basic Scalability', 'System Architecture'] }
        ],
        registrationProcess: [
            'Search for university roles on Adobe Careers',
            'Submit application and complete coding challenge',
            'Virtual onsite interview loop'
        ],
        compensation: {
            base: '₹18L - ₹24L',
            bonus: '10% - 15%',
            stock: 'RSUs',
            relocation: '₹1.5L',
            totalYear1: '₹30L - ₹45L+'
        },
        prepFocus: 'Focus on strings and complex data structures. Adobe interviews are very technical.',
        insiderScoop: 'Adobe looks for "product-minded" engineers. Show passion for creativity and high-quality software.',
        jobsLink: '/jobs?company=Adobe'
    },
    {
        id: 'krutrim',
        slug: 'krutrim-ai',
        name: 'Krutrim AI',
        industry: 'AI',
        logo: 'https://logos.hunter.io/krutrim.ai',
        hq: 'Bangalore, India',
        locations: ['Bangalore'],
        category: 'High-Growth AI & Deep-Tech Startups',
        hiringSeasons: 'Rolling',
        hiringType: 'Direct Hire',
        hiringZone: 'off-campus',
        roles: ['AI Researcher', 'ML Engineer'],
        difficulty: 'Hard',
        difficultyLevel: 5,
        roundsCount: 4,
        process: [
            { name: 'Technical Screen', details: 'Math and ML fundamentals.' },
            { name: 'Onsite', details: 'Deep dive into LLM architectures.' }
        ],
                testPattern: [
            {
                section: 'Coding',
                questions: '3 Qs',
                duration: '90 mins'
            },
            {
                section: 'Aptitude & MCQs',
                questions: '20 Qs',
                duration: '30 mins'
            }
        ],
        syllabus: [
            {
                round: 'Coding',
                topics: [
                    { name: 'Dynamic Programming', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Graphs', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Trees & Arrays', questions: '1', duration: '30 mins', difficulty: 'Medium' }
                ]
            },
            {
                round: 'CS Fundamentals & MCQs',
                topics: [
                    { name: 'OS & DBMS', questions: '10', duration: '15 mins', difficulty: 'Medium' },
                    { name: 'Computer Networks', questions: '5', duration: '10 mins', difficulty: 'Medium' },
                    { name: 'Aptitude', questions: '5', duration: '5 mins', difficulty: 'Easy' }
                ]
            }
        ],
        registrationProcess: [
            'Visit the company Careers page',
            'Apply through the Campus drive or referral link',
            'Shortlisted candidates receive test link'
        ],
compensation: {
            base: '₹20L - ₹35L',
            bonus: 'Variable',
            stock: 'Equity',
            relocation: '₹50k',
            totalYear1: '₹25L - ₹45L+'
        },
        prepFocus: 'Focus on Indian language models and large-scale training.',
        insiderScoop: 'Ola\'s AI venture. Very fast-paced and ambitious.',
        jobsLink: '/jobs?company=Krutrim'
    },
    {
        id: 'zepto',
        slug: 'zepto',
        name: 'Zepto',
        industry: 'Quick Commerce',
        logo: 'https://logos.hunter.io/zepto.com',
        hq: 'Mumbai, India',
        locations: ['Bangalore', 'Mumbai'],
        category: 'High-Growth AI & Deep-Tech Startups',
        hiringSeasons: 'Year-round',
        hiringType: 'Campus / Referrals',
        hiringZone: 'on-campus',
        roles: ['SDE-1', 'Operations Analyst'],
        difficulty: 'Medium',
        difficultyLevel: 3,
        roundsCount: 3,
        process: [
            { name: 'Technical 1', details: 'DSA (Medium).' },
            { name: 'Technical 2', details: 'Backend/Mobile specific coding.' }
        ],
                testPattern: [
            {
                section: 'Coding',
                questions: '3 Qs',
                duration: '90 mins'
            },
            {
                section: 'Aptitude & MCQs',
                questions: '20 Qs',
                duration: '30 mins'
            }
        ],
        syllabus: [
            {
                round: 'Coding',
                topics: [
                    { name: 'Dynamic Programming', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Graphs', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Trees & Arrays', questions: '1', duration: '30 mins', difficulty: 'Medium' }
                ]
            },
            {
                round: 'CS Fundamentals & MCQs',
                topics: [
                    { name: 'OS & DBMS', questions: '10', duration: '15 mins', difficulty: 'Medium' },
                    { name: 'Computer Networks', questions: '5', duration: '10 mins', difficulty: 'Medium' },
                    { name: 'Aptitude', questions: '5', duration: '5 mins', difficulty: 'Easy' }
                ]
            }
        ],
        registrationProcess: [
            'Visit the company Careers page',
            'Apply through the Campus drive or referral link',
            'Shortlisted candidates receive test link'
        ],
compensation: {
            base: '₹15L - ₹20L',
            bonus: '₹2L',
            stock: 'ESOPs',
            relocation: '₹50k',
            totalYear1: '₹18L - ₹25L'
        },
        prepFocus: 'Focus on high-concurrency systems and logistics optimization.',
        insiderScoop: 'Extremely fast growth. They value speed and execution.',
        jobsLink: '/jobs?company=Zepto'
    },
    {
        id: 'skyroot',
        slug: 'skyroot-aerospace',
        name: 'Skyroot Aerospace',
        industry: 'Aerospace',
        logo: 'https://logos.hunter.io/skyroot.in',
        hq: 'Hyderabad, India',
        locations: ['Hyderabad'],
        category: 'High-Growth AI & Deep-Tech Startups',
        hiringSeasons: 'Rolling',
        hiringType: 'Direct Hire',
        hiringZone: 'off-campus',
        roles: ['Aerospace Engineer', 'SDE (Guidance & Control)'],
        difficulty: 'Hard',
        difficultyLevel: 5,
        roundsCount: 4,
        process: [
            { name: 'Domain Screen', details: 'Aerodynamics and Rocketry basics.' },
            { name: 'Technical 1', details: 'Systems design and simulation.' }
        ],
                testPattern: [
            {
                section: 'Coding',
                questions: '3 Qs',
                duration: '90 mins'
            },
            {
                section: 'Aptitude & MCQs',
                questions: '20 Qs',
                duration: '30 mins'
            }
        ],
        syllabus: [
            {
                round: 'Coding',
                topics: [
                    { name: 'Dynamic Programming', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Graphs', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Trees & Arrays', questions: '1', duration: '30 mins', difficulty: 'Medium' }
                ]
            },
            {
                round: 'CS Fundamentals & MCQs',
                topics: [
                    { name: 'OS & DBMS', questions: '10', duration: '15 mins', difficulty: 'Medium' },
                    { name: 'Computer Networks', questions: '5', duration: '10 mins', difficulty: 'Medium' },
                    { name: 'Aptitude', questions: '5', duration: '5 mins', difficulty: 'Easy' }
                ]
            }
        ],
        registrationProcess: [
            'Visit the company Careers page',
            'Apply through the Campus drive or referral link',
            'Shortlisted candidates receive test link'
        ],
compensation: {
            base: '₹12L - ₹20L',
            bonus: 'Variable',
            stock: 'ESOPs',
            relocation: 'Support provided',
            totalYear1: '₹15L - ₹25L'
        },
        prepFocus: 'Deep knowledge of physics and systems engineering.',
        insiderScoop: 'Working on India\'s first private rockets. Passion for space is a must.',
        jobsLink: '/jobs?company=Skyroot'
    },
    {
        id: 'samsung',
        slug: 'samsung-research',
        name: 'Samsung (R&D India)',
        industry: 'Tech',
        logo: 'https://logos.hunter.io/samsung.com',
        hq: 'Seoul, South Korea',
        locations: ['Bangalore', 'Noida', 'Delhi'],
        category: 'Specialized Engineering & Industry Leaders',
        hiringSeasons: 'Aug-Oct',
        hiringType: 'Campus Recruitment',
        hiringZone: 'on-campus',
        coverImage: '/samsung_office.png',
        roles: ['Research Engineer', 'SDE'],
        difficulty: 'Medium',
        difficultyLevel: 3,
        roundsCount: 3,
        eligibility: {
            academic: "60% or 6.0 CGPA throughout",
            qualification: "BE/B.Tech, ME/M.Tech",
            backlogs: "No active backlogs"
        },
        selectionProcess: [
            { name: 'GSAT', details: 'Global Samsung Aptitude Test.' },
            { name: 'Software Competency Test', details: '3-hour advanced coding challenge.' },
            { name: 'Technical Interviews', details: '2 rounds focused on problem solving and projects.' },
            { name: 'HR Interview', details: 'Behavioral and fitment.' }
        ],
        testPattern: [
            { section: 'Aptitude (GSAT)', questions: '50 Qs', duration: '60 mins' },
            { section: 'Coding', questions: '1-2 Qs', duration: '180 mins' }
        ],
        syllabus: [
            { round: 'GSAT', topics: ['Quant', 'Data Interpretation', 'Logical Reasoning', 'Puzzles'] },
            { round: 'Coding', topics: ['Advanced DSA', 'Complex Simulation', 'Recursion'] }
        ],
        registrationProcess: [
            'Visit Samsung Careers India portal',
            'Register for University Hiring',
            'Complete GSAT and SW Test as scheduled',
            'Attend virtual/onsite interview rounds'
        ],
        compensation: {
            base: '₹14L - ₹18L',
            bonus: '₹2L - ₹4L',
            stock: 'N/A',
            relocation: '₹1L',
            totalYear1: '₹16L - ₹22L'
        },
        prepFocus: 'Samsung\'s coding test is unique. Practice complex simulation problems on SW Expert Academy.',
        insiderScoop: 'If you clear the SW test, you are 90% in. Focus on that.',
        jobsLink: '/jobs?company=Samsung'
    },
    {
        id: 'salesforce',
        slug: 'salesforce',
        name: 'Salesforce',
        industry: 'SaaS',
        logo: 'https://logos.hunter.io/salesforce.com',
        hq: 'San Francisco, CA',
        locations: ['Hyderabad', 'Bangalore'],
        category: 'Specialized Engineering & Industry Leaders',
        hiringSeasons: 'Fall',
        hiringType: 'University Hiring',
        hiringZone: 'on-campus',
        coverImage: '/salesforce_office.png',
        roles: ['SDE-1', 'AMTS'],
        difficulty: 'Hard',
        difficultyLevel: 4,
        roundsCount: 4,
        eligibility: {
            academic: "Degree in CS or related fields",
            qualification: "B.Tech/M.Tech",
            skills: "Java, OOPS, and Cloud fundamentals"
        },
        selectionProcess: [
            { name: 'Online Assessment', details: 'Aptitude + DSA questions on HackerRank.' },
            { name: 'Technical Interviews', details: '2 rounds of problem solving and project deep dive.' },
            { name: 'Design Round', details: 'Focus on LLD and System Design basics.' },
            { name: 'HR Interview', details: 'Culture fit and values alignment.' }
        ],
        testPattern: [
            { section: 'Aptitude', questions: '20 Qs', duration: '30 mins' },
            { section: 'Coding', questions: '2 Qs', duration: '60 mins' }
        ],
        syllabus: [
            { round: 'Technical', topics: ['Java OOPS', 'Design Patterns', 'Cloud Architecture', 'DSA'] },
            { round: 'Culture', topics: ['Ohana Values', 'Sustainability', 'Philanthropy'] }
        ],
        registrationProcess: [
            'Apply via Salesforce University portal',
            'Learn via Trailhead to understand the platform',
            'Submit application and schedule assessments',
            'Virtual onsite interview loop'
        ],
        compensation: {
            base: '₹18L - ₹24L',
            bonus: '10% - 15%',
            stock: '₹15L - ₹25L',
            relocation: '₹1.5L',
            totalYear1: '₹35L - ₹45L+'
        },
        prepFocus: 'Focus on Java, Design Patterns, and Cloud architecture.',
        insiderScoop: 'Salesforce values their "Ohana" culture. Be collaborative and humble.',
        jobsLink: '/jobs?company=Salesforce'
    },
    {
        id: 'micron',
        slug: 'micron',
        name: 'Micron Technology',
        industry: 'Semiconductors',
        logo: 'https://logos.hunter.io/micron.com',
        hq: 'Boise, ID',
        locations: ['Hyderabad'],
        category: 'Specialized Engineering & Industry Leaders',
        hiringSeasons: 'Year-round',
        hiringType: 'University Hiring',
        hiringZone: 'on-campus',
        coverImage: '/micron_office.png',
        roles: ['VLSI Engineer', 'SDE'],
        difficulty: 'Hard',
        difficultyLevel: 4,
        roundsCount: 4,
        eligibility: {
            academic: "Strong base in Digital Logic and Circuits",
            qualification: "B.Tech/M.Tech (EE, ECE, CS)"
        },
        selectionProcess: [
            { name: 'Online Assessment', details: 'Technical Aptitude, Programming MCQs, and Coding.' },
            { name: 'Technical Interviews', details: '2 rounds of technical and behavioral discussions.' },
            { name: 'Assessment Centre', details: 'Optional group activities or simulations.' }
        ],
        testPattern: [
            { section: 'Aptitude/Tech MCQ', questions: '40 Qs', duration: '60 mins' },
            { section: 'Coding', questions: '1 Q', duration: '30 mins' }
        ],
        syllabus: [
            { round: 'Technical', topics: ['Digital Electronics', 'Computer Architecture', 'Memory (SRAM/DRAM)', 'OS'] },
            { round: 'Programming', topics: ['C/C++', 'Python', 'Output prediction', 'Debugging'] }
        ],
        registrationProcess: [
            'Search for "NCG" or "University" roles on Micron Jobs',
            'Apply with a focus on hardware/semiconductor projects',
            'Complete the technical assessment if shortlisted',
            'Participate in interview rounds'
        ],
        compensation: {
            base: '₹15L - ₹22L',
            bonus: '₹2L - ₹4L',
            stock: 'N/A',
            relocation: 'Full Support',
            totalYear1: '₹18L - ₹26L'
        },
        prepFocus: 'Deep knowledge of Digital Logic, OS internals (Paging, Mutex), and Memory Design.',
        insiderScoop: 'Micron is the leader in memory. They look for deep hardware expertise and problem-solving passion.',
        jobsLink: '/jobs?company=Micron'
    },
    {
        id: 'cognizant',
        slug: 'cognizant',
        name: 'Cognizant',
        industry: 'IT Services',
        logo: 'https://logos.hunter.io/cognizant.com',
        hq: 'Teaneck, NJ',
        locations: ['Across India'],
        category: 'Major IT Services & Consulting',
        hiringSeasons: 'Mass Recruitment (July-Sept)',
        hiringType: 'Campus Placements',
        hiringZone: 'on-campus',
        coverImage: '/cognizant_office.png',
        roles: ['GenC', 'GenC Elevate', 'GenC Next'],
        difficulty: 'Medium',
        difficultyLevel: 3,
        roundsCount: 4,
        eligibility: {
            academic: "60% or 6.0 CGPA throughout (10th, 12th, UG/PG)",
            qualification: "BE/B.Tech, ME/M.Tech, MCA, M.Sc",
            batch: "2026",
            backlogs: "No active backlogs"
        },
        selectionProcess: [
            { name: 'Communication Assessment', details: 'Elimination round focusing on verbal skills.' },
            { name: 'Aptitude Assessment', details: 'Numerical, Logical, and Verbal reasoning.' },
            { name: 'Technical Assessment', details: 'Coding assessment with 3 questions.' },
            { name: 'Technical + HR Interview', details: 'Final round focusing on projects and culture fit.' }
        ],
                                        testPattern: [
            {
                section: 'Round 1 - Communication Assessment',
                questions: '-',
                duration: '60 mins'
            },
            {
                section: 'Round 2 - Quants + Game Based Assessment',
                questions: '-',
                duration: '80 mins'
            },
            {
                section: 'Round 3 - Technical Assessment (Coding)',
                questions: '-',
                duration: '120 mins'
            },
            {
                section: 'Round 4 - GenC Technical + HR Interview',
                questions: '-',
                duration: '-'
            },
        ],
                                        syllabus: [
        {
            round: 'Quantitative Aptitude',
            topics: [
                {
                    name: 'Basic Mathematics: LCM & HCF, Divisibility, Numbers/decimals/power, Averages, Ratio & Proportion, Algebra, Surds & Indices',
                    questions: '0 or 1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Applied Mathematics: Profit and Loss, Simple/Compound Interest, Time/Speed/Distance, Inverse, Time and Work, Allegation & Mixtures, Percentage, Area/shape/perimeter',
                    questions: '0 or 1',
                    duration: '2 mins',
                    difficulty: 'Medium'
                },
                {
                    name: 'Engineering Mathematics: Logarithms, Permutation/Combinations, Probability, Pipes and Cisterns, Geometry/Coordinate Geometry, Clocks & Calendar, Problem on Ages',
                    questions: '1',
                    duration: '1 min 10 secs',
                    difficulty: 'High'
                },
            ]
        },
        {
            round: 'Game Based Aptitude',
            topics: [
                {
                    name: 'Deductive Logical Thinking(Geo-Sudo)',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Inductive-logical Thinking',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Grid Challenge',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Motion Challenge',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Switch Challenge',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Digit Challenge',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Round 1 - Communication Assessment',
            topics: [
                'Duration: 60 mins',
                'Details: AI-based online test. Sections: Reading + Listening, Speaking, Grammar. Elimination round with strict cutoff.',
                'Negative Marking: N/A',
            ]
        },
        {
            round: 'Round 3 - Technical Assessment (Coding)',
            topics: [
                'Duration: 120 mins',
                'Details: 2 Coding questions (1 medium, 1 hard).',
                'Negative Marking: N/A',
            ]
        },
        {
            round: 'Round 4 - GenC Technical + HR Interview',
            topics: [
                'Details: Interview phase.',
            ]
        },
    ],
        registrationProcess: [
            'Receive registration email from Cognizant',
            'Register on the official career portal',
            'Fill application form and upload documents',
            'Submit application'
        ],
        compensation: {
            base: '4 LPA - 6.75 LPA',
            bonus: 'N/A',
            stock: 'N/A',
            relocation: 'Variable',
            totalYear1: '₹4,50,000 - ₹7,50,000'
        },
        prepFocus: 'Focus on DB concepts and basic programming. GenC Next/Elevate requires strong coding.',
        insiderScoop: 'GenC Elevate roles require better coding skills and offer a higher package. Communication round is key.',
        jobsLink: '/jobs?company=Cognizant'
    },
    {
        id: 'capgemini',
        slug: 'capgemini',
        name: 'Capgemini',
        industry: 'IT Services',
        logo: 'https://logos.hunter.io/capgemini.com',
        hq: 'Paris, France',
        locations: ['Across India'],
        category: 'Major IT Services & Consulting',
        hiringSeasons: 'Mass Recruitment (July-Sept)',
        hiringType: 'Campus Placements',
        hiringZone: 'on-campus',
        roles: ['Analyst', 'Senior Analyst'],
        difficulty: 'Medium',
        difficultyLevel: 3,
        roundsCount: 4,
        eligibility: {
            academic: "60% in 10th, 12th, and Graduation",
            qualification: "BE/B.Tech, ME/M.Tech, MCA",
            backlogs: "Max 1 active backlog",
            gapInEducation: "Max 2 years"
        },
        selectionProcess: [
            { name: 'Online Assessment', details: 'Tech, English, Game, Behavioral rounds.' },
            { name: 'Coding Round', details: '2 Questions in 45 mins.' },
            { name: 'Technical Interview', details: 'Core subjects and projects.' },
            { name: 'HR Interview', details: 'Behavioral and communication.' }
        ],
                                        testPattern: [
            {
                section: 'Round 1: Online Assessment - Technical MCQs + Pseudocode',
                questions: '40 Qs',
                duration: '40–50 minutes'
            },
            {
                section: 'Round 1: Online Assessment - English / Communication Test',
                questions: '30 Qs',
                duration: '30 minutes'
            },
            {
                section: 'Round 1: Online Assessment - Game Based Cognitive Test',
                questions: '4 Games out of 24',
                duration: '20–30 minutes'
            },
            {
                section: 'Round 1: Online Assessment - Behavioral / PowerSkills (mainly Off Campus)',
                questions: '~100',
                duration: '20–25 minutes'
            },
            {
                section: 'Round 2: Coding Round - Coding Questions',
                questions: '2 Qs',
                duration: '45 minutes'
            },
            {
                section: 'Round 3: Technical Interview - Technical + Resume Discussion',
                questions: 'Q&A',
                duration: '20–35 minutes'
            },
            {
                section: 'Round 4: HR Interview - Behavioral Assessment',
                questions: 'Q&A',
                duration: '10–20 minutes'
            },
        ],
                                        syllabus: [
        {
            round: 'Technical Test',
            topics: [
                {
                    name: 'C',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'C++',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'OOPS',
                    questions: '1 or 2',
                    duration: '2 mins',
                    difficulty: 'High'
                },
                {
                    name: 'Data Structures',
                    questions: '1 or 2',
                    duration: '2 mins',
                    difficulty: 'High'
                },
                {
                    name: 'Pseudo Code',
                    questions: '1 or 2',
                    duration: '2 mins',
                    difficulty: 'High'
                },
                {
                    name: 'SQL / DBMS',
                    questions: '1 or 2',
                    duration: '2 mins',
                    difficulty: 'High'
                },
                {
                    name: 'Computer Networks',
                    questions: '1',
                    duration: '1 min 15 secs',
                    difficulty: 'High'
                },
                {
                    name: 'Operating System',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'English Communication',
            topics: [
                {
                    name: 'Sentence Correction',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Prepositions',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Grammar',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Reading Comprehension',
                    questions: '1',
                    duration: '3 mins',
                    difficulty: 'High'
                },
                {
                    name: 'Synonyms & Antonym',
                    questions: '1 or 2',
                    duration: '30 secs',
                    difficulty: 'Easy'
                },
                {
                    name: 'Speech and Tenses',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Article',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Sentence Selection',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Spotting Error',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
                {
                    name: 'Sentence Arrangement',
                    questions: '1 or 2',
                    duration: '45 secs',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Game Based Aptitude',
            topics: [
                {
                    name: 'Deductive Logical Thinking(Geo-Sudo)',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Inductive-logical Thinking',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Motion Challenge',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Switch Challenge',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Digit Challenge',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
                {
                    name: 'Grid Challenge',
                    questions: '1',
                    duration: '1 min',
                    difficulty: 'Medium'
                },
            ]
        },
        {
            round: 'Round 1: Online Assessment - Technical MCQs + Pseudocode',
            topics: [
                'Total Questions: 40 Qs',
                'Duration: 40–50 minutes',
            ]
        },
        {
            round: 'Round 1: Online Assessment - English / Communication Test',
            topics: [
                'Total Questions: 30 Qs',
                'Duration: 30 minutes',
            ]
        },
        {
            round: 'Round 1: Online Assessment - Behavioral / PowerSkills (mainly Off Campus)',
            topics: [
                'Total Questions: ~100',
                'Duration: 20–25 minutes',
            ]
        },
        {
            round: 'Round 2: Coding Round - Coding Questions',
            topics: [
                'Total Questions: 2 Qs',
                'Duration: 45 minutes',
                'Note: 1 question solved = 5.75 LPA, 2 questions solved = 7.50 LPA. Preferred languages: C, C++, Java, Python. Difficulty: High.',
            ]
        },
        {
            round: 'Round 3: Technical Interview - Technical + Resume Discussion',
            topics: [
                'Total Questions: Q&A',
                'Duration: 20–35 minutes',
            ]
        },
        {
            round: 'Round 4: HR Interview - Behavioral Assessment',
            topics: [
                'Total Questions: Q&A',
                'Duration: 10–20 minutes',
            ]
        },
    ],
        registrationProcess: [
            'Register on Capgemini Career Portal',
            'Fill application form and submit'
        ],
        compensation: {
            base: '4 LPA - 7.5 LPA',
            bonus: 'N/A',
            stock: 'N/A',
            relocation: 'Variable',
            totalYear1: '₹4,50,000 - ₹8,00,000'
        },
        prepFocus: 'Game-based aptitude tests are unique to Capgemini. Practice pseudo code.',
        insiderScoop: 'They value logical thinking more than syntax knowledge. Game-based rounds are crucial for clearing the first level.',
        jobsLink: '/jobs?company=Capgemini'
    },
    {
        id: 'epam',
        slug: 'epam',
        name: 'EPAM Systems',
        industry: 'IT Services',
        logo: 'https://logos.hunter.io/epam.com',
        hq: 'Newtown, PA',
        locations: ['Hyderabad', 'Pune', 'Bangalore'],
        category: 'Major IT Services & Consulting',
        hiringSeasons: 'July-Sept',
        hiringType: 'Off-Campus / Hackathons',
        hiringZone: 'off-campus',
        roles: ['Junior Software Engineer'],
        difficulty: 'Medium',
        difficultyLevel: 3,
        roundsCount: 4,
        process: [
            { name: 'Online Coding Test', details: 'Core Java/DSA.' },
            { name: 'Technical Interview 1', details: 'Deep dive into OOPs and Java.' },
            { name: 'Technical Interview 2', details: 'Problem solving and system design basics.' },
            { name: 'HR Interview', details: 'Cultural fit and English proficiency.' }
        ],
                testPattern: [
            {
                section: 'Coding',
                questions: '3 Qs',
                duration: '90 mins'
            },
            {
                section: 'Aptitude & MCQs',
                questions: '20 Qs',
                duration: '30 mins'
            }
        ],
        syllabus: [
            {
                round: 'Coding',
                topics: [
                    { name: 'Dynamic Programming', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Graphs', questions: '1', duration: '30 mins', difficulty: 'Hard' },
                    { name: 'Trees & Arrays', questions: '1', duration: '30 mins', difficulty: 'Medium' }
                ]
            },
            {
                round: 'CS Fundamentals & MCQs',
                topics: [
                    { name: 'OS & DBMS', questions: '10', duration: '15 mins', difficulty: 'Medium' },
                    { name: 'Computer Networks', questions: '5', duration: '10 mins', difficulty: 'Medium' },
                    { name: 'Aptitude', questions: '5', duration: '5 mins', difficulty: 'Easy' }
                ]
            }
        ],
        registrationProcess: [
            'Visit the company Careers page',
            'Apply through the Campus drive or referral link',
            'Shortlisted candidates receive test link'
        ],
compensation: {
            base: '6 LPA - 8 LPA',
            bonus: 'N/A',
            stock: 'N/A',
            relocation: 'Variable',
            totalYear1: '₹6,50,000 - ₹8,50,000'
        },
        prepFocus: 'High focus on Java, OOPs, and core programming concepts.',
        insiderScoop: 'EPAM has a higher technical bar than other service companies. Strong Java skills are a must.',
        jobsLink: '/jobs?company=EPAM'
    }
];

export const CATEGORIES = [
    'All Categories',
    'Global Big Tech & AI Labs',
    'Major IT Services & Consulting',
    'Top Product & Fintech (India)',
    'High-Growth AI & Deep-Tech Startups',
    'Specialized Engineering & Industry Leaders'
];

export const ROLES = ['All Roles', 'SDE', 'Data Analyst', 'Cloud Engineer', 'Backend Engineer', 'Hardware Engineer', 'AI Researcher', 'Embedded SDE', 'VLSI Engineer', 'Research Engineer', 'Operations Analyst'];
export const DIFFICULTIES = ['All Levels', 'Easy', 'Medium', 'Hard'];

export const HIRING_TIMELINE = [
    {
        id: 'jul',
        month: 'July',
        title: 'The Warm-Up',
        description: 'Mass hiring begins for service-based giants. Early birds start their prep.',
        events: [
            { company: 'TCS', title: 'Mass Recruitment Opens', type: 'Application', zone: 'on-campus', logo: 'https://logos.hunter.io/tcs.com' },
            { company: 'Infosys', title: 'HackWithInfy / Infytq', type: 'Assessment', zone: 'on-campus', logo: 'https://logos.hunter.io/infosys.com' },
            { company: 'Wipro', title: 'Elite National Talent Hunt', type: 'Assessment', zone: 'on-campus', logo: 'https://logos.hunter.io/wipro.com' },
            { company: 'Cognizant', title: 'GenC Off-Campus', type: 'Application', zone: 'on-campus', logo: 'https://logos.hunter.io/cognizant.com' },
            { company: 'Accenture', title: 'Cognitive Assessments', type: 'Assessment', zone: 'on-campus', logo: 'https://logos.hunter.io/accenture.com' },
            { company: 'Capgemini', title: 'Exceller Drive Begins', type: 'Application', zone: 'on-campus', logo: 'https://logos.hunter.io/capgemini.com' },
            { company: 'EPAM', title: 'Junior SWE Drive', type: 'Assessment', zone: 'off-campus', logo: 'https://logos.hunter.io/epam.com' }
        ]
    },
    {
        id: 'aug',
        month: 'August',
        title: 'The OA Avalanche',
        description: 'Big Tech and top product companies drop their Online Assessments.',
        events: [
            { company: 'Amazon', title: 'OA Drops (SDE-1)', type: 'Assessment', zone: 'off-campus', logo: 'https://logos.hunter.io/amazon.com' },
            { company: 'Oracle', title: 'OA Drops', type: 'Assessment', zone: 'off-campus', logo: 'https://logos.hunter.io/oracle.com' },
            { company: 'Microsoft', title: 'University Hiring Opens', type: 'Application', zone: 'on-campus', logo: 'https://logos.hunter.io/microsoft.com' },
            { company: 'Swiggy', title: 'Campus Drives Begin', type: 'Application', zone: 'on-campus', logo: 'https://logos.hunter.io/swiggy.com' },
            { company: 'Flipkart', title: 'APM & SDE Hiring', type: 'Application', zone: 'on-campus', logo: 'https://logos.hunter.io/flipkart.com' }
        ]
    },
    {
        id: 'sep',
        month: 'September',
        title: 'The Resume Screen',
        description: 'Global tech giants review resumes and send out interview invites.',
        events: [
            { company: 'Google', title: 'Resume Screens', type: 'Screening', zone: 'off-campus', logo: 'https://logos.hunter.io/google.com' },
            { company: 'Meta', title: 'Resume Screens', type: 'Screening', zone: 'off-campus', logo: 'https://logos.hunter.io/meta.com' },
            { company: 'PhonePe', title: 'University Hiring', type: 'Application', zone: 'on-campus', logo: 'https://logos.hunter.io/phonepe.com' },
            { company: 'Salesforce', title: 'AMTS Roles Open', type: 'Application', zone: 'on-campus', logo: 'https://logos.hunter.io/salesforce.com' }
        ]
    },
    {
        id: 'oct',
        month: 'October',
        title: 'The Interview Grind',
        description: 'Peak season for technical deep-dives and virtual onsites.',
        events: [
            { company: 'Google', title: 'Technical Interviews', type: 'Interview', zone: 'off-campus', logo: 'https://logos.hunter.io/google.com' },
            { company: 'Meta', title: 'Virtual Onsites', type: 'Interview', zone: 'off-campus', logo: 'https://logos.hunter.io/meta.com' },
            { company: 'Apple', title: 'Deep Dives', type: 'Interview', zone: 'off-campus', logo: 'https://logos.hunter.io/apple.com' }
        ]
    },
    {
        id: 'nov',
        month: 'November',
        title: 'The Offer Wave',
        description: 'The first major wave of offer letters rolling out.',
        events: [
            { company: 'Multiple', title: 'Offer Rollouts', type: 'Offer', zone: 'off-campus', logo: null }
        ]
    }
];
