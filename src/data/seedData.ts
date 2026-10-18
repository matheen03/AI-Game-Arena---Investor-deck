import { Game, Investment, PTMInvestment } from '../utils/rules';

export const SECTIONS = [
  '8A', '8B', '8C', '8D', '8E', '8F', '8G', '8H', '8I', '8J', '8K', '8L'
] as const;

export type SectionCode = typeof SECTIONS[number];

export const CATEGORIES = [
  'Arcade Retro',
  'Platformer & Action',
  'Puzzle & Logic',
  'Desert & Racing',
  'AI & Sci-Fi',
  'Strategy & Defense',
  'Trivia & Heritage'
] as const;

export interface RosterStudent {
  id: string;
  name: string;
  section: SectionCode;
  teamName: string;
}

// Official Section Rosters: Authenticated student identities to prevent self-investment bypass
export const SECTION_ROSTERS: Record<SectionCode, RosterStudent[]> = {
  '8A': [
    { id: 'STU-8A-001', name: 'Tariq Al-Harbi', section: '8A', teamName: 'Cyber Falcons' },
    { id: 'STU-8A-002', name: 'Omar Al-Ghamdi', section: '8A', teamName: 'Cyber Falcons' },
    { id: 'STU-8A-003', name: 'Fahad Al-Otaibi', section: '8A', teamName: 'Dune Drifters' },
    { id: 'STU-8A-004', name: 'Saud Al-Shehri', section: '8A', teamName: 'Dune Drifters' },
    { id: 'STU-8A-005', name: 'Khalid Al-Zahrani', section: '8A', teamName: 'Pixel Oasis' },
    { id: 'STU-8A-006', name: 'Bader Al-Dosari', section: '8A', teamName: 'Pixel Oasis' },
    { id: 'STU-8A-007', name: 'Ziyad Al-Mutairi', section: '8A', teamName: 'Neural Knights' },
    { id: 'STU-8A-008', name: 'Nawaf Al-Subaie', section: '8A', teamName: 'Neural Knights' },
    { id: 'STU-8A-009', name: 'Rayan Al-Qarni', section: '8A', teamName: 'Turbo Strikers' },
    { id: 'STU-8A-010', name: 'Sultan Al-Shammari', section: '8A', teamName: 'Turbo Strikers' },
    { id: 'STU-8A-011', name: 'Mansour Al-Bishi', section: '8A', teamName: 'Code Alchemists' },
    { id: 'STU-8A-012', name: 'Hamad Al-Kahtani', section: '8A', teamName: 'Code Alchemists' },
  ],
  '8B': [
    { id: 'STU-8B-001', name: 'Abdullah Al-Amri', section: '8B', teamName: 'Red Sea Explorers' },
    { id: 'STU-8B-002', name: 'Yousef Al-Husseini', section: '8B', teamName: 'Red Sea Explorers' },
    { id: 'STU-8B-003', name: 'Majed Al-Ghamdi', section: '8B', teamName: 'Solar Pioneers' },
    { id: 'STU-8B-004', name: 'Ibrahim Al-Sayed', section: '8B', teamName: 'Solar Pioneers' },
    { id: 'STU-8B-005', name: 'Meshal Al-Khatib', section: '8B', teamName: 'Skyline Architects' },
    { id: 'STU-8B-006', name: 'Turki Al-Rasheed', section: '8B', teamName: 'Skyline Architects' },
    { id: 'STU-8B-007', name: 'Bader Al-Mansour', section: '8B', teamName: 'Red Sand Studios' },
    { id: 'STU-8B-008', name: 'Firas Al-Ghamdi', section: '8B', teamName: 'Red Sand Studios' },
    { id: 'STU-8B-009', name: 'Mazen Al-Shahrani', section: '8B', teamName: 'Oasis Tech' },
    { id: 'STU-8B-010', name: 'Rayyan Al-Otaibi', section: '8B', teamName: 'Oasis Tech' },
    { id: 'STU-8B-011', name: 'Talal Al-Harbi', section: '8B', teamName: 'Cyber Palms' },
    { id: 'STU-8B-012', name: 'Saud Al-Farhan', section: '8B', teamName: 'Cyber Palms' },
  ],
  '8C': [
    { id: 'STU-8C-001', name: 'Ahmed Al-Thani', section: '8C', teamName: 'Desert Fox Studios' },
    { id: 'STU-8C-002', name: 'Hassan Al-Saeed', section: '8C', teamName: 'Desert Fox Studios' },
    { id: 'STU-8C-003', name: 'Bandar Al-Sulaiman', section: '8C', teamName: 'Cosmic Camels' },
    { id: 'STU-8C-004', name: 'Waleed Al-Malki', section: '8C', teamName: 'Cosmic Camels' },
    { id: 'STU-8C-005', name: 'Tariq Al-Qadi', section: '8C', teamName: 'Mirage Labs' },
    { id: 'STU-8C-006', name: 'Karim Al-Hassan', section: '8C', teamName: 'Mirage Labs' },
    { id: 'STU-8C-007', name: 'Ziyad Al-Bishi', section: '8C', teamName: 'Dune Racers' },
    { id: 'STU-8C-008', name: 'Fahad Al-Dossari', section: '8C', teamName: 'Dune Racers' },
    { id: 'STU-8C-009', name: 'Sultan Al-Ajmi', section: '8C', teamName: 'Astro Squad' },
    { id: 'STU-8C-010', name: 'Khalid Al-Ghamdi', section: '8C', teamName: 'Astro Squad' },
    { id: 'STU-8C-011', name: 'Omar Al-Juhani', section: '8C', teamName: 'Falcon Code' },
    { id: 'STU-8C-012', name: 'Hamad Al-Subaie', section: '8C', teamName: 'Falcon Code' },
  ],
  '8D': [
    { id: 'STU-8D-001', name: 'Sami Al-Najjar', section: '8D', teamName: 'Viper Mechanics' },
    { id: 'STU-8D-002', name: 'Rami Al-Qadi', section: '8D', teamName: 'Viper Mechanics' },
    { id: 'STU-8D-003', name: 'Hani Al-Harbi', section: '8D', teamName: 'Turbo Knights' },
    { id: 'STU-8D-004', name: 'Adel Al-Mutairi', section: '8D', teamName: 'Turbo Knights' },
    { id: 'STU-8D-005', name: 'Nawaf Al-Otaibi', section: '8D', teamName: 'Apex Racing' },
    { id: 'STU-8D-006', name: 'Bader Al-Shehri', section: '8D', teamName: 'Apex Racing' },
    { id: 'STU-8D-007', name: 'Salman Al-Bawardi', section: '8D', teamName: 'Formula Desert' },
    { id: 'STU-8D-008', name: 'Moath Al-Farhan', section: '8D', teamName: 'Formula Desert' },
    { id: 'STU-8D-009', name: 'Rayyan Al-Zahrani', section: '8D', teamName: 'Red Dune' },
    { id: 'STU-8D-010', name: 'Fahad Al-Malki', section: '8D', teamName: 'Red Dune' },
    { id: 'STU-8D-011', name: 'Yousef Al-Saeed', section: '8D', teamName: 'Cyber Speed' },
    { id: 'STU-8D-012', name: 'Mansour Al-Qarni', section: '8D', teamName: 'Cyber Speed' },
  ],
  '8E': [
    { id: 'STU-8E-001', name: 'Zayd Al-Muzaini', section: '8E', teamName: 'Algorithm Assassins' },
    { id: 'STU-8E-002', name: 'Karim Al-Hassan', section: '8E', teamName: 'Algorithm Assassins' },
    { id: 'STU-8E-003', name: 'Tariq Al-Dosari', section: '8E', teamName: 'Quantum Coders' },
    { id: 'STU-8E-004', name: 'Omar Al-Mutairi', section: '8E', teamName: 'Quantum Coders' },
    { id: 'STU-8E-005', name: 'Fahad Al-Harbi', section: '8E', teamName: 'Cipher Team' },
    { id: 'STU-8E-006', name: 'Khalid Al-Ghamdi', section: '8E', teamName: 'Cipher Team' },
    { id: 'STU-8E-007', name: 'Saud Al-Otaibi', section: '8E', teamName: 'Matrix Masters' },
    { id: 'STU-8E-008', name: 'Bader Al-Subaie', section: '8E', teamName: 'Matrix Masters' },
    { id: 'STU-8E-009', name: 'Ziyad Al-Shehri', section: '8E', teamName: 'AI Core' },
    { id: 'STU-8E-010', name: 'Nawaf Al-Bishi', section: '8E', teamName: 'AI Core' },
    { id: 'STU-8E-011', name: 'Sultan Al-Kahtani', section: '8E', teamName: 'Logic Bytes' },
    { id: 'STU-8E-012', name: 'Rayan Al-Shammari', section: '8E', teamName: 'Logic Bytes' },
  ],
  '8F': [
    { id: 'STU-8F-001', name: 'Talal Al-Juhani', section: '8F', teamName: 'Green Desert Labs' },
    { id: 'STU-8F-002', name: 'Anas Al-Ghamdi', section: '8F', teamName: 'Green Desert Labs' },
    { id: 'STU-8F-003', name: 'Majed Al-Mutlaq', section: '8F', teamName: 'Flora AI' },
    { id: 'STU-8F-004', name: 'Ibrahim Al-Bishi', section: '8F', teamName: 'Flora AI' },
    { id: 'STU-8F-005', name: 'Firas Al-Otaibi', section: '8F', teamName: 'Eco Sandbox' },
    { id: 'STU-8F-006', name: 'Mazen Al-Harbi', section: '8F', teamName: 'Eco Sandbox' },
    { id: 'STU-8F-007', name: 'Bader Al-Zahrani', section: '8F', teamName: 'Terraform' },
    { id: 'STU-8F-008', name: 'Turki Al-Shehri', section: '8F', teamName: 'Terraform' },
    { id: 'STU-8F-009', name: 'Yazid Al-Qurashi', section: '8F', teamName: 'Cloud Seeders' },
    { id: 'STU-8F-010', name: 'Adel Al-Barrak', section: '8F', teamName: 'Cloud Seeders' },
    { id: 'STU-8F-011', name: 'Sami Al-Subaie', section: '8F', teamName: 'Oasis Drone' },
    { id: 'STU-8F-012', name: 'Rami Al-Dosari', section: '8F', teamName: 'Oasis Drone' },
  ],
  '8G': [
    { id: 'STU-8G-001', name: 'Firas Al-Mutlaq', section: '8G', teamName: 'Riyadh Sparks' },
    { id: 'STU-8G-002', name: 'Mazen Al-Tamimi', section: '8G', teamName: 'Riyadh Sparks' },
    { id: 'STU-8G-003', name: 'Tariq Al-Shehri', section: '8G', teamName: 'Neon Riders' },
    { id: 'STU-8G-004', name: 'Omar Al-Bawardi', section: '8G', teamName: 'Neon Riders' },
    { id: 'STU-8G-005', name: 'Fahad Al-Farhan', section: '8G', teamName: 'Highway Stunt' },
    { id: 'STU-8G-006', name: 'Saud Al-Ghamdi', section: '8G', teamName: 'Highway Stunt' },
    { id: 'STU-8G-007', name: 'Khalid Al-Otaibi', section: '8G', teamName: 'Synth Beat' },
    { id: 'STU-8G-008', name: 'Bader Al-Harbi', section: '8G', teamName: 'Synth Beat' },
    { id: 'STU-8G-009', name: 'Ziyad Al-Zahrani', section: '8G', teamName: 'Cyber Moto' },
    { id: 'STU-8G-010', name: 'Nawaf Al-Dosari', section: '8G', teamName: 'Cyber Moto' },
    { id: 'STU-8G-011', name: 'Rayan Al-Subaie', section: '8G', teamName: 'Speed Sparks' },
    { id: 'STU-8G-012', name: 'Sultan Al-Malki', section: '8G', teamName: 'Speed Sparks' },
  ],
  '8H': [
    { id: 'STU-8H-001', name: 'Salman Al-Bawardi', section: '8H', teamName: 'Bedouin Builders' },
    { id: 'STU-8H-002', name: 'Moath Al-Farhan', section: '8H', teamName: 'Bedouin Builders' },
    { id: 'STU-8H-003', name: 'Majed Al-Harbi', section: '8H', teamName: 'Nomad Camp' },
    { id: 'STU-8H-004', name: 'Ibrahim Al-Ghamdi', section: '8H', teamName: 'Nomad Camp' },
    { id: 'STU-8H-005', name: 'Talal Al-Otaibi', section: '8H', teamName: 'Desert Stars' },
    { id: 'STU-8H-006', name: 'Anas Al-Shehri', section: '8H', teamName: 'Desert Stars' },
    { id: 'STU-8H-007', name: 'Firas Al-Zahrani', section: '8H', teamName: 'Compass Quest' },
    { id: 'STU-8H-008', name: 'Mazen Al-Dosari', section: '8H', teamName: 'Compass Quest' },
    { id: 'STU-8H-009', name: 'Bader Al-Mutairi', section: '8H', teamName: 'Night Dunes' },
    { id: 'STU-8H-010', name: 'Turki Al-Subaie', section: '8H', teamName: 'Night Dunes' },
    { id: 'STU-8H-011', name: 'Yazid Al-Kahtani', section: '8H', teamName: 'Heritage Camp' },
    { id: 'STU-8H-012', name: 'Adel Al-Bishi', section: '8H', teamName: 'Heritage Camp' },
  ],
  '8I': [
    { id: 'STU-8I-001', name: 'Yazid Al-Qurashi', section: '8I', teamName: 'Star Navigators' },
    { id: 'STU-8I-002', name: 'Adel Al-Barrak', section: '8I', teamName: 'Star Navigators' },
    { id: 'STU-8I-003', name: 'Tariq Al-Malki', section: '8I', teamName: 'Astrolabe Quest' },
    { id: 'STU-8I-004', name: 'Omar Al-Juhani', section: '8I', teamName: 'Astrolabe Quest' },
    { id: 'STU-8I-005', name: 'Fahad Al-Bishi', section: '8I', teamName: 'Sea Dhows' },
    { id: 'STU-8I-006', name: 'Saud Al-Harbi', section: '8I', teamName: 'Sea Dhows' },
    { id: 'STU-8I-007', name: 'Khalid Al-Ghamdi', section: '8I', teamName: 'Arabian Horizon' },
    { id: 'STU-8I-008', name: 'Bader Al-Otaibi', section: '8I', teamName: 'Arabian Horizon' },
    { id: 'STU-8I-009', name: 'Ziyad Al-Shehri', section: '8I', teamName: 'Celestial Voyagers' },
    { id: 'STU-8I-010', name: 'Nawaf Al-Zahrani', section: '8I', teamName: 'Celestial Voyagers' },
    { id: 'STU-8I-011', name: 'Rayan Al-Dosari', section: '8I', teamName: 'Brass Stars' },
    { id: 'STU-8I-012', name: 'Sultan Al-Subaie', section: '8I', teamName: 'Brass Stars' },
  ],
  '8J': [
    { id: 'STU-8J-001', name: 'Nayef Al-Husseini', section: '8J', teamName: 'Oryx Speedsters' },
    { id: 'STU-8J-002', name: 'Faris Al-Amoudi', section: '8J', teamName: 'Oryx Speedsters' },
    { id: 'STU-8J-003', name: 'Majed Al-Ghamdi', section: '8J', teamName: 'Kingdom Cup' },
    { id: 'STU-8J-004', name: 'Ibrahim Al-Harbi', section: '8J', teamName: 'Kingdom Cup' },
    { id: 'STU-8J-005', name: 'Talal Al-Otaibi', section: '8J', teamName: 'Canyon Dash' },
    { id: 'STU-8J-006', name: 'Anas Al-Shehri', section: '8J', teamName: 'Canyon Dash' },
    { id: 'STU-8J-007', name: 'Firas Al-Zahrani', section: '8J', teamName: 'Turbo Oryx' },
    { id: 'STU-8J-008', name: 'Mazen Al-Dosari', section: '8J', teamName: 'Turbo Oryx' },
    { id: 'STU-8J-009', name: 'Bader Al-Subaie', section: '8J', teamName: 'Desert Athletic' },
    { id: 'STU-8J-010', name: 'Turki Al-Bishi', section: '8J', teamName: 'Desert Athletic' },
    { id: 'STU-8J-011', name: 'Salman Al-Kahtani', section: '8J', teamName: 'Sprint Mirage' },
    { id: 'STU-8J-012', name: 'Moath Al-Shammari', section: '8J', teamName: 'Sprint Mirage' },
  ],
  '8K': [
    { id: 'STU-8K-001', name: 'Rayyan Al-Jadaan', section: '8K', teamName: 'Hyperion AI' },
    { id: 'STU-8K-002', name: 'Bariq Al-Hamdan', section: '8K', teamName: 'Hyperion AI' },
    { id: 'STU-8K-003', name: 'Tariq Al-Ghamdi', section: '8K', teamName: 'Gemini Code Duel' },
    { id: 'STU-8K-004', name: 'Omar Al-Harbi', section: '8K', teamName: 'Gemini Code Duel' },
    { id: 'STU-8K-005', name: 'Fahad Al-Otaibi', section: '8K', teamName: 'Code Arena' },
    { id: 'STU-8K-006', name: 'Saud Al-Shehri', section: '8K', teamName: 'Code Arena' },
    { id: 'STU-8K-007', name: 'Khalid Al-Zahrani', section: '8K', teamName: 'Adaptive Bot' },
    { id: 'STU-8K-008', name: 'Bader Al-Dosari', section: '8K', teamName: 'Adaptive Bot' },
    { id: 'STU-8K-009', name: 'Ziyad Al-Subaie', section: '8K', teamName: 'Neural Duel' },
    { id: 'STU-8K-010', name: 'Nawaf Al-Malki', section: '8K', teamName: 'Neural Duel' },
    { id: 'STU-8K-011', name: 'Rayan Al-Kahtani', section: '8K', teamName: 'Prompt Wars' },
    { id: 'STU-8K-012', name: 'Sultan Al-Bishi', section: '8K', teamName: 'Prompt Wars' },
  ],
  '8L': [
    { id: 'STU-8L-001', name: 'Zahir Al-Sharif', section: '8L', teamName: 'Desert Tempest' },
    { id: 'STU-8L-002', name: 'Ghaith Al-Kindi', section: '8L', teamName: 'Desert Tempest' },
    { id: 'STU-8L-003', name: 'Majed Al-Harbi', section: '8L', teamName: 'Citadel Defense' },
    { id: 'STU-8L-004', name: 'Ibrahim Al-Ghamdi', section: '8L', teamName: 'Citadel Defense' },
    { id: 'STU-8L-005', name: 'Talal Al-Otaibi', section: '8L', teamName: 'Vortex Towers' },
    { id: 'STU-8L-006', name: 'Anas Al-Shehri', section: '8L', teamName: 'Vortex Towers' },
    { id: 'STU-8L-007', name: 'Firas Al-Zahrani', section: '8L', teamName: 'Laser Citadel' },
    { id: 'STU-8L-008', name: 'Mazen Al-Dosari', section: '8L', teamName: 'Laser Citadel' },
    { id: 'STU-8L-009', name: 'Bader Al-Subaie', section: '8L', teamName: 'Sand Whirlwind' },
    { id: 'STU-8L-010', name: 'Turki Al-Bishi', section: '8L', teamName: 'Sand Whirlwind' },
    { id: 'STU-8L-011', name: 'Salman Al-Kahtani', section: '8L', teamName: 'Tempest Blitz' },
    { id: 'STU-8L-012', name: 'Moath Al-Shammari', section: '8L', teamName: 'Tempest Blitz' },
  ],
};

export const INITIAL_GAMES: Game[] = [
  // Section 8A
  {
    id: 'game-8a-01',
    section: '8A',
    teamName: 'Cyber Falcons',
    student1: 'Tariq Al-Harbi',
    student2: 'Omar Al-Ghamdi',
    gameTitle: 'Falcon Flight 2099',
    category: 'AI & Sci-Fi',
    description: 'An AI-augmented cyber falcon dodging supersonic sandstorm obstacles over futuristic Riyadh.',
    netlifyUrl: 'https://falcon-flight-8a.netlify.app',
    isVerified: true,
    isFinalist: true,
    createdAt: '2026-10-15T08:30:00Z'
  },
  {
    id: 'game-8a-02',
    section: '8A',
    teamName: 'Dune Drifters',
    student1: 'Fahad Al-Otaibi',
    student2: 'Saud Al-Shehri',
    gameTitle: 'Dune Drift Rally',
    category: 'Desert & Racing',
    description: 'Physics-based desert buggy racing over dynamic dunes with Gemini-assisted track generation.',
    netlifyUrl: 'https://dune-drift-8a.netlify.app',
    isVerified: true,
    isFinalist: true,
    createdAt: '2026-10-15T08:35:00Z'
  },
  {
    id: 'game-8a-03',
    section: '8A',
    teamName: 'Pixel Oasis',
    student1: 'Khalid Al-Zahrani',
    student2: 'Bader Al-Dosari',
    gameTitle: 'Oasis Waterkeeper',
    category: 'Strategy & Defense',
    description: 'Manage water conduits and solar pump stations against desert heatwaves in a retro pixel style.',
    netlifyUrl: 'https://oasis-waterkeeper-8a.netlify.app',
    isVerified: true,
    isFinalist: false,
    createdAt: '2026-10-15T08:40:00Z'
  },
  {
    id: 'game-8a-04',
    section: '8A',
    teamName: 'Neural Knights',
    student1: 'Ziyad Al-Mutairi',
    student2: 'Nawaf Al-Subaie',
    gameTitle: 'AlUla Mystery Maze',
    category: 'Puzzle & Logic',
    description: 'Explore the ancient stone pillars of Hegra to solve optical light beam puzzles.',
    netlifyUrl: 'https://alula-maze-8a.netlify.app',
    isVerified: true,
    isFinalist: false,
    createdAt: '2026-10-15T08:45:00Z'
  },
  {
    id: 'game-8a-05',
    section: '8A',
    teamName: 'Turbo Strikers',
    student1: 'Rayan Al-Qarni',
    student2: 'Sultan Al-Shammari',
    gameTitle: 'Gravity Goalie 3000',
    category: 'Arcade Retro',
    description: 'High-speed arcade pong and gravity goal shooter with bouncing neon balls.',
    netlifyUrl: 'https://gravity-goalie-8a.netlify.app',
    isVerified: true,
    isFinalist: false,
    createdAt: '2026-10-15T08:50:00Z'
  },
  {
    id: 'game-8a-06',
    section: '8A',
    teamName: 'Code Alchemists',
    student1: 'Mansour Al-Bishi',
    student2: 'Hamad Al-Kahtani',
    gameTitle: 'Heritage Quest: Diriyah',
    category: 'Trivia & Heritage',
    description: 'Interactive cultural RPG answering historical trivia to rebuild mud-brick fortresses.',
    netlifyUrl: 'https://diriyah-quest-8a.netlify.app',
    isVerified: true,
    isFinalist: false,
    createdAt: '2026-10-15T08:55:00Z'
  },
  // Section 8B
  {
    id: 'game-8b-01',
    section: '8B',
    teamName: 'Red Sea Explorers',
    student1: 'Abdullah Al-Amri',
    student2: 'Yousef Al-Husseini',
    gameTitle: 'Coral Reef Defender',
    category: 'Platformer & Action',
    description: 'Submarine arcade cleaning microplastics and protecting sea turtles along the Red Sea coast.',
    netlifyUrl: 'https://coral-defender-8b.netlify.app',
    isVerified: true,
    isFinalist: true,
    createdAt: '2026-10-15T09:10:00Z'
  },
  {
    id: 'game-8b-02',
    section: '8B',
    teamName: 'Solar Pioneers',
    student1: 'Majed Al-Ghamdi',
    student2: 'Ibrahim Al-Sayed',
    gameTitle: 'Solar Grid Tycoon',
    category: 'Strategy & Defense',
    description: 'Balance energy generation from mega solar farms across the desert to power smart cities.',
    netlifyUrl: 'https://solar-grid-8b.netlify.app',
    isVerified: true,
    isFinalist: false,
    createdAt: '2026-10-15T09:15:00Z'
  },
  {
    id: 'game-8b-03',
    section: '8B',
    teamName: 'Skyline Architects',
    student1: 'Meshal Al-Khatib',
    student2: 'Turki Al-Rasheed',
    gameTitle: 'Tower of The Line',
    category: 'Arcade Retro',
    description: 'Precision stacking vertical eco-towers with zero gravity physics and wind turbulence.',
    netlifyUrl: 'https://theline-tower-8b.netlify.app',
    isVerified: true,
    isFinalist: false,
    createdAt: '2026-10-15T09:20:00Z'
  },
  // Section 8C
  {
    id: 'game-8c-01',
    section: '8C',
    teamName: 'Desert Fox Studios',
    student1: 'Ahmed Al-Thani',
    student2: 'Hassan Al-Saeed',
    gameTitle: 'Fox Runner: Mirage',
    category: 'Platformer & Action',
    description: 'Endless runner with shifting sand mirages, oasis power-ups and nocturnal desert creatures.',
    netlifyUrl: 'https://fox-runner-8c.netlify.app',
    isVerified: true,
    isFinalist: true,
    createdAt: '2026-10-15T09:40:00Z'
  },
  {
    id: 'game-8c-02',
    section: '8C',
    teamName: 'Cosmic Camels',
    student1: 'Bandar Al-Sulaiman',
    student2: 'Waleed Al-Malki',
    gameTitle: 'Astro Camel Odyssey',
    category: 'AI & Sci-Fi',
    description: 'Space camel jumping between low-gravity asteroids collecting starlight water droplets.',
    netlifyUrl: 'https://astro-camel-8c.netlify.app',
    isVerified: true,
    isFinalist: false,
    createdAt: '2026-10-15T09:45:00Z'
  },
  // Section 8D
  {
    id: 'game-8d-01',
    section: '8D',
    teamName: 'Viper Mechanics',
    student1: 'Sami Al-Najjar',
    student2: 'Rami Al-Qadi',
    gameTitle: 'Formula Desert E-Prix',
    category: 'Desert & Racing',
    description: 'Electric racing formula cars dodging dust devils on the Riyadh street circuit.',
    netlifyUrl: 'https://desert-eprix-8d.netlify.app',
    isVerified: true,
    isFinalist: true,
    createdAt: '2026-10-15T10:00:00Z'
  },
  // Section 8E
  {
    id: 'game-8e-01',
    section: '8E',
    teamName: 'Algorithm Assassins',
    student1: 'Zayd Al-Muzaini',
    student2: 'Karim Al-Hassan',
    gameTitle: 'Quantum Cipher Escape',
    category: 'Puzzle & Logic',
    description: 'Decode binary signals and mathematical matrices to escape an AI supercomputer core.',
    netlifyUrl: 'https://quantum-cipher-8e.netlify.app',
    isVerified: true,
    isFinalist: true,
    createdAt: '2026-10-15T10:30:00Z'
  },
  // Section 8F
  {
    id: 'game-8f-01',
    section: '8F',
    teamName: 'Green Desert Labs',
    student1: 'Talal Al-Juhani',
    student2: 'Anas Al-Ghamdi',
    gameTitle: 'Flora Sandbox',
    category: 'Strategy & Defense',
    description: 'Terraform barren sand into lush date palm groves using sustainable cloud-seeding drones.',
    netlifyUrl: 'https://flora-sandbox-8f.netlify.app',
    isVerified: true,
    isFinalist: true,
    createdAt: '2026-10-15T11:00:00Z'
  },
  // Section 8G
  {
    id: 'game-8g-01',
    section: '8G',
    teamName: 'Riyadh Sparks',
    student1: 'Firas Al-Mutlaq',
    student2: 'Mazen Al-Tamimi',
    gameTitle: 'Neon Highway Stunt',
    category: 'Arcade Retro',
    description: 'Cyberpunk highway motorcycle stunts with speed boosts and synthwave beats.',
    netlifyUrl: 'https://neon-highway-8g.netlify.app',
    isVerified: true,
    isFinalist: false,
    createdAt: '2026-10-15T11:30:00Z'
  },
  // Section 8H
  {
    id: 'game-8h-01',
    section: '8H',
    teamName: 'Bedouin Builders',
    student1: 'Salman Al-Bawardi',
    student2: 'Moath Al-Farhan',
    gameTitle: 'Nomad Camp Survival',
    category: 'Strategy & Defense',
    description: 'Survive harsh star-lit nights, craft compasses, and navigate by constellation maps.',
    netlifyUrl: 'https://nomad-camp-8h.netlify.app',
    isVerified: true,
    isFinalist: false,
    createdAt: '2026-10-15T12:00:00Z'
  },
  // Section 8I
  {
    id: 'game-8i-01',
    section: '8I',
    teamName: 'Star Navigators',
    student1: 'Yazid Al-Qurashi',
    student2: 'Adel Al-Barrak',
    gameTitle: 'Astrolabe Quest',
    category: 'Puzzle & Logic',
    description: 'Align antique astronomical brass astrolabes to navigate sailing dhows across the Arabian Sea.',
    netlifyUrl: 'https://astrolabe-8i.netlify.app',
    isVerified: true,
    isFinalist: false,
    createdAt: '2026-10-15T12:30:00Z'
  },
  // Section 8J
  {
    id: 'game-8j-01',
    section: '8J',
    teamName: 'Oryx Speedsters',
    student1: 'Nayef Al-Husseini',
    student2: 'Faris Al-Amoudi',
    gameTitle: 'Oryx Dash: Kingdom Cup',
    category: 'Desert & Racing',
    description: 'High-speed animal athletic dash with turbo leaps over canyon crevices.',
    netlifyUrl: 'https://oryx-dash-8j.netlify.app',
    isVerified: true,
    isFinalist: false,
    createdAt: '2026-10-15T13:00:00Z'
  },
  // Section 8K
  {
    id: 'game-8k-01',
    section: '8K',
    teamName: 'Hyperion AI',
    student1: 'Rayyan Al-Jadaan',
    student2: 'Bariq Al-Hamdan',
    gameTitle: 'Gemini Code Duel',
    category: 'Trivia & Heritage',
    description: 'Competitive rapid-fire coding and logic puzzle arena against an adaptive AI bot.',
    netlifyUrl: 'https://code-duel-8k.netlify.app',
    isVerified: true,
    isFinalist: false,
    createdAt: '2026-10-15T13:30:00Z'
  },
  // Section 8L
  {
    id: 'game-8l-01',
    section: '8L',
    teamName: 'Desert Tempest',
    student1: 'Zahir Al-Sharif',
    student2: 'Ghaith Al-Kindi',
    gameTitle: 'Tempest Tower Blitz',
    category: 'Arcade Retro',
    description: 'Laser tower defense warding off sand whirlwind vortexes over a desert citadel.',
    netlifyUrl: 'https://tempest-tower-8l.netlify.app',
    isVerified: true,
    isFinalist: false,
    createdAt: '2026-10-15T14:00:00Z'
  }
];

export const INITIAL_INVESTMENTS: Investment[] = [
  // Section 8A investments (12 eligible investors in 8A)
  {
    id: 'inv-8a-01',
    section: '8A',
    gameId: 'game-8a-01',
    investorId: 'STU-8A-003',
    investorName: 'Fahad Al-Otaibi',
    studentTeamName: 'Dune Drifters',
    coins: 40,
    timestamp: '2026-10-15T09:00:00Z'
  },
  {
    id: 'inv-8a-02',
    section: '8A',
    gameId: 'game-8a-02',
    investorId: 'STU-8A-001',
    investorName: 'Tariq Al-Harbi',
    studentTeamName: 'Cyber Falcons',
    coins: 50,
    timestamp: '2026-10-15T09:02:00Z'
  },
  {
    id: 'inv-8a-03',
    section: '8A',
    gameId: 'game-8a-01',
    investorId: 'STU-8A-005',
    investorName: 'Khalid Al-Zahrani',
    studentTeamName: 'Pixel Oasis',
    coins: 35,
    timestamp: '2026-10-15T09:03:00Z'
  },
  {
    id: 'inv-8a-04',
    section: '8A',
    gameId: 'game-8a-04',
    investorId: 'STU-8A-005',
    investorName: 'Khalid Al-Zahrani',
    studentTeamName: 'Pixel Oasis',
    coins: 30,
    timestamp: '2026-10-15T09:04:00Z'
  },
  {
    id: 'inv-8a-05',
    section: '8A',
    gameId: 'game-8a-02',
    investorId: 'STU-8A-007',
    investorName: 'Ziyad Al-Mutairi',
    studentTeamName: 'Neural Knights',
    coins: 45,
    timestamp: '2026-10-15T09:05:00Z'
  },
  {
    id: 'inv-8a-06',
    section: '8A',
    gameId: 'game-8a-03',
    investorId: 'STU-8A-003',
    investorName: 'Fahad Al-Otaibi',
    studentTeamName: 'Dune Drifters',
    coins: 30,
    timestamp: '2026-10-15T09:06:00Z'
  },
  {
    id: 'inv-8a-07',
    section: '8A',
    gameId: 'game-8a-05',
    investorId: 'STU-8A-001',
    investorName: 'Tariq Al-Harbi',
    studentTeamName: 'Cyber Falcons',
    coins: 30,
    timestamp: '2026-10-15T09:07:00Z'
  },
  // Section 8B investments
  {
    id: 'inv-8b-01',
    section: '8B',
    gameId: 'game-8b-01',
    investorId: 'STU-8B-003',
    investorName: 'Majed Al-Ghamdi',
    studentTeamName: 'Solar Pioneers',
    coins: 60,
    timestamp: '2026-10-15T09:25:00Z'
  },
  {
    id: 'inv-8b-02',
    section: '8B',
    gameId: 'game-8b-02',
    investorId: 'STU-8B-001',
    investorName: 'Abdullah Al-Amri',
    studentTeamName: 'Red Sea Explorers',
    coins: 50,
    timestamp: '2026-10-15T09:26:00Z'
  },
  // Section 8C investments
  {
    id: 'inv-8c-01',
    section: '8C',
    gameId: 'game-8c-01',
    investorId: 'STU-8C-003',
    investorName: 'Bandar Al-Sulaiman',
    studentTeamName: 'Cosmic Camels',
    coins: 55,
    timestamp: '2026-10-15T09:50:00Z'
  }
];

export const INITIAL_PTM_INVESTMENTS: PTMInvestment[] = [
  {
    id: 'ptm-01',
    gameId: 'game-8a-01',
    investorId: 'PARENT_VIP_Dr_Tariq_Al_Ghamdi',
    parentName: 'Dr. Tariq Al-Ghamdi (Parent)',
    coins: 150,
    timestamp: '2026-10-16T18:00:00Z'
  },
  {
    id: 'ptm-02',
    gameId: 'game-8a-02',
    investorId: 'PARENT_VIP_Eng_Saud_Al_Shehri',
    parentName: 'Eng. Saud Al-Shehri (Parent)',
    coins: 120,
    timestamp: '2026-10-16T18:05:00Z'
  },
  {
    id: 'ptm-03',
    gameId: 'game-8b-01',
    investorId: 'PARENT_VIP_Nouf_Al_Amri',
    parentName: 'Nouf Al-Amri (Parent)',
    coins: 200,
    timestamp: '2026-10-16T18:10:00Z'
  }
];
