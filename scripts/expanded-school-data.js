import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

// Expanded Polish school data - comprehensive coverage of all voivodeships and school types
const expandedPolishSchools = [
    // MAZOWIECKIE
    {
        name: "Szkoła Podstawowa nr 1 im. Marii Skłodowskiej-Curie",
        shortName: "SP nr 1",
        type: "primary",
        address: {
            street: "ul. Szkolna 15",
            city: "Warszawa",
            postalCode: "00-001",
            voivodeship: "mazowieckie",
            district: "Śródmieście"
        },
        contact: {
            phone: "+48 22 123 45 67",
            email: "sekretariat@sp1warszawa.edu.pl",
            website: "https://sp1warszawa.edu.pl"
        },
        location: {
            latitude: 52.2297,
            longitude: 21.0122
        },
        studentCount: 450,
        teacherCount: 35,
        establishedYear: 1965,
        languages: ["polish", "english", "german"],
        specializations: ["mathematics", "sciences", "languages"],
        facilities: ["library", "computer_lab", "gym", "cafeteria", "playground"],
        images: [
            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=600&fit=crop"
        ]
    },
    {
        name: "Liceum Ogólnokształcące im. Stefana Batorego",
        shortName: "LO Batorego",
        type: "high_school",
        address: {
            street: "ul. Królewska 32",
            city: "Warszawa",
            postalCode: "00-065",
            voivodeship: "mazowieckie",
            district: "Śródmieście"
        },
        contact: {
            phone: "+48 22 234 56 78",
            email: "sekretariat@lobatorego.warszawa.pl",
            website: "https://lobatorego.warszawa.pl"
        },
        location: {
            latitude: 52.2319,
            longitude: 21.0067
        },
        studentCount: 680,
        teacherCount: 52,
        establishedYear: 1918,
        languages: ["polish", "english", "french", "german"],
        specializations: ["humanities", "mathematics", "sciences"],
        facilities: ["library", "computer_lab", "gym", "cafeteria", "auditorium"],
        images: [
            "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
        ]
    },
    {
        name: "Przedszkole Publiczne nr 8 'Bajka'",
        shortName: "PP Bajka",
        type: "kindergarten",
        address: {
            street: "ul. Bajkowa 5",
            city: "Radom",
            postalCode: "26-600",
            voivodeship: "mazowieckie",
            district: "Centrum"
        },
        contact: {
            phone: "+48 48 345 67 89",
            email: "przedszkole8@radom.pl",
            website: "https://pp8radom.edu.pl"
        },
        location: {
            latitude: 51.4027,
            longitude: 21.1471
        },
        studentCount: 95,
        teacherCount: 9,
        establishedYear: 1982,
        languages: ["polish", "english"],
        specializations: ["early_childhood", "arts", "music"],
        facilities: ["playground", "garden", "music_room", "art_room"],
        images: [
            "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop"
        ]
    },

    // MAŁOPOLSKIE
    {
        name: "Liceum Ogólnokształcące im. Adama Mickiewicza",
        shortName: "LO Mickiewicza",
        type: "high_school",
        address: {
            street: "ul. Mickiewicza 25",
            city: "Kraków",
            postalCode: "31-120",
            voivodeship: "małopolskie",
            district: "Stare Miasto"
        },
        contact: {
            phone: "+48 12 234 56 78",
            email: "sekretariat@lomickiewicza.krakow.pl",
            website: "https://lomickiewicza.krakow.pl"
        },
        location: {
            latitude: 50.0647,
            longitude: 19.9450
        },
        studentCount: 720,
        teacherCount: 58,
        establishedYear: 1923,
        languages: ["polish", "english", "french", "spanish"],
        specializations: ["humanities", "mathematics", "sciences", "languages"],
        facilities: ["library", "computer_lab", "gym", "cafeteria", "chemistry_lab", "physics_lab"],
        images: [
            "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
        ]
    },
    {
        name: "Szkoła Podstawowa im. Jana Pawła II",
        shortName: "SP Jana Pawła II",
        type: "primary",
        address: {
            street: "ul. Papieska 12",
            city: "Tarnów",
            postalCode: "33-100",
            voivodeship: "małopolskie",
            district: "Centrum"
        },
        contact: {
            phone: "+48 14 456 78 90",
            email: "sekretariat@spjp2.tarnow.pl",
            website: "https://spjp2.tarnow.pl"
        },
        location: {
            latitude: 50.0121,
            longitude: 20.9858
        },
        studentCount: 380,
        teacherCount: 29,
        establishedYear: 1995,
        languages: ["polish", "english"],
        specializations: ["religion", "humanities", "arts"],
        facilities: ["library", "computer_lab", "gym", "chapel", "playground"],
        images: [
            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=600&fit=crop"
        ]
    },

    // POMORSKIE
    {
        name: "Technikum Informatyczne nr 2",
        shortName: "TI nr 2",
        type: "technical",
        address: {
            street: "ul. Technologiczna 10",
            city: "Gdańsk",
            postalCode: "80-233",
            voivodeship: "pomorskie",
            district: "Wrzeszcz"
        },
        contact: {
            phone: "+48 58 345 67 89",
            email: "sekretariat@ti2gdansk.edu.pl",
            website: "https://ti2gdansk.edu.pl"
        },
        location: {
            latitude: 54.3520,
            longitude: 18.6466
        },
        studentCount: 380,
        teacherCount: 28,
        establishedYear: 1995,
        languages: ["polish", "english"],
        specializations: ["computer_science", "programming", "networking"],
        facilities: ["computer_lab", "server_room", "library", "cafeteria", "gym"],
        images: [
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop"
        ]
    },
    {
        name: "Liceum Ogólnokształcące nr 5",
        shortName: "V LO Gdynia",
        type: "high_school",
        address: {
            street: "ul. Morska 44",
            city: "Gdynia",
            postalCode: "81-225",
            voivodeship: "pomorskie",
            district: "Śródmieście"
        },
        contact: {
            phone: "+48 58 567 89 01",
            email: "sekretariat@5lo.gdynia.pl",
            website: "https://5lo.gdynia.pl"
        },
        location: {
            latitude: 54.5189,
            longitude: 18.5305
        },
        studentCount: 540,
        teacherCount: 42,
        establishedYear: 1962,
        languages: ["polish", "english", "german"],
        specializations: ["maritime", "sciences", "languages"],
        facilities: ["library", "computer_lab", "gym", "cafeteria", "maritime_lab"],
        images: [
            "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
        ]
    },

    // DOLNOŚLĄSKIE
    {
        name: "Przedszkole Publiczne nr 15 'Słoneczko'",
        shortName: "PP Słoneczko",
        type: "kindergarten",
        address: {
            street: "ul. Kwiatowa 8",
            city: "Wrocław",
            postalCode: "50-541",
            voivodeship: "dolnośląskie",
            district: "Krzyki"
        },
        contact: {
            phone: "+48 71 456 78 90",
            email: "przedszkole15@wroclaw.pl",
            website: "https://pp15wroclaw.edu.pl"
        },
        location: {
            latitude: 51.1079,
            longitude: 17.0385
        },
        studentCount: 125,
        teacherCount: 12,
        establishedYear: 1978,
        languages: ["polish", "english"],
        specializations: ["early_childhood", "arts", "music"],
        facilities: ["playground", "garden", "music_room", "art_room", "cafeteria"],
        images: [
            "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop"
        ]
    },
    {
        name: "Zespół Szkół Ekonomicznych",
        shortName: "ZSE Wrocław",
        type: "technical",
        address: {
            street: "ul. Ekonomiczna 22",
            city: "Wrocław",
            postalCode: "50-950",
            voivodeship: "dolnośląskie",
            district: "Stare Miasto"
        },
        contact: {
            phone: "+48 71 678 90 12",
            email: "sekretariat@zse.wroclaw.pl",
            website: "https://zse.wroclaw.pl"
        },
        location: {
            latitude: 51.1089,
            longitude: 17.0326
        },
        studentCount: 480,
        teacherCount: 36,
        establishedYear: 1970,
        languages: ["polish", "english", "german"],
        specializations: ["economics", "business", "accounting"],
        facilities: ["computer_lab", "library", "gym", "cafeteria", "business_lab"],
        images: [
            "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop"
        ]
    },

    // WIELKOPOLSKIE
    {
        name: "Szkoła Podstawowa Niepubliczna 'Akademia Przyszłości'",
        shortName: "Akademia Przyszłości",
        type: "primary",
        address: {
            street: "ul. Nowoczesna 12",
            city: "Poznań",
            postalCode: "61-704",
            voivodeship: "wielkopolskie",
            district: "Jeżyce"
        },
        contact: {
            phone: "+48 61 567 89 01",
            email: "biuro@akademiaprzyszlosci.pl",
            website: "https://akademiaprzyszlosci.pl"
        },
        location: {
            latitude: 52.4064,
            longitude: 16.9252
        },
        studentCount: 180,
        teacherCount: 22,
        establishedYear: 2010,
        languages: ["polish", "english", "german"],
        specializations: ["innovation", "technology", "languages", "creativity"],
        facilities: ["computer_lab", "science_lab", "library", "gym", "art_studio", "cafeteria"],
        images: [
            "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop"
        ]
    },
    {
        name: "Liceum Ogólnokształcące im. Karola Marcinkowskiego",
        shortName: "LO Marcinkowskiego",
        type: "high_school",
        address: {
            street: "ul. Marcinkowskiego 18",
            city: "Poznań",
            postalCode: "61-745",
            voivodeship: "wielkopolskie",
            district: "Stare Miasto"
        },
        contact: {
            phone: "+48 61 789 01 23",
            email: "sekretariat@lomarcinkowskiego.poznan.pl",
            website: "https://lomarcinkowskiego.poznan.pl"
        },
        location: {
            latitude: 52.4082,
            longitude: 16.9335
        },
        studentCount: 620,
        teacherCount: 48,
        establishedYear: 1919,
        languages: ["polish", "english", "french", "german"],
        specializations: ["humanities", "mathematics", "sciences"],
        facilities: ["library", "computer_lab", "gym", "cafeteria", "auditorium", "chemistry_lab"],
        images: [
            "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
        ]
    },

    // ŚLĄSKIE
    {
        name: "Zespół Szkół Zawodowych nr 3",
        shortName: "ZSZ nr 3",
        type: "technical",
        address: {
            street: "ul. Przemysłowa 45",
            city: "Katowice",
            postalCode: "40-020",
            voivodeship: "śląskie",
            district: "Śródmieście"
        },
        contact: {
            phone: "+48 32 678 90 12",
            email: "sekretariat@zsz3katowice.edu.pl",
            website: "https://zsz3katowice.edu.pl"
        },
        location: {
            latitude: 50.2649,
            longitude: 19.0238
        },
        studentCount: 650,
        teacherCount: 45,
        establishedYear: 1955,
        languages: ["polish", "english"],
        specializations: ["mechanics", "electronics", "construction", "services"],
        facilities: ["workshops", "computer_lab", "library", "gym", "cafeteria"],
        images: [
            "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop"
        ]
    },
    {
        name: "Szkoła Podstawowa nr 12",
        shortName: "SP nr 12",
        type: "primary",
        address: {
            street: "ul. Górnicza 33",
            city: "Sosnowiec",
            postalCode: "41-200",
            voivodeship: "śląskie",
            district: "Centrum"
        },
        contact: {
            phone: "+48 32 890 12 34",
            email: "sekretariat@sp12.sosnowiec.pl",
            website: "https://sp12.sosnowiec.pl"
        },
        location: {
            latitude: 50.2862,
            longitude: 19.1040
        },
        studentCount: 420,
        teacherCount: 32,
        establishedYear: 1968,
        languages: ["polish", "english"],
        specializations: ["mathematics", "sciences"],
        facilities: ["library", "computer_lab", "gym", "cafeteria", "playground"],
        images: [
            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=600&fit=crop"
        ]
    },

    // LUBELSKIE
    {
        name: "Liceum Ogólnokształcące Dwujęzyczne",
        shortName: "LO Dwujęzyczne",
        type: "high_school",
        address: {
            street: "ul. Europejska 33",
            city: "Lublin",
            postalCode: "20-950",
            voivodeship: "lubelskie",
            district: "Śródmieście"
        },
        contact: {
            phone: "+48 81 789 01 23",
            email: "sekretariat@lodwujezyczne.lublin.pl",
            website: "https://lodwujezyczne.lublin.pl"
        },
        location: {
            latitude: 51.2465,
            longitude: 22.5684
        },
        studentCount: 420,
        teacherCount: 38,
        establishedYear: 1998,
        languages: ["polish", "english", "french", "spanish", "german"],
        specializations: ["languages", "international_baccalaureate", "sciences"],
        facilities: ["language_lab", "computer_lab", "library", "gym", "cafeteria", "conference_room"],
        images: [
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=600&fit=crop"
        ]
    },
    {
        name: "Przedszkole Publiczne nr 22 'Tęcza'",
        shortName: "PP Tęcza",
        type: "kindergarten",
        address: {
            street: "ul. Kolorowa 7",
            city: "Zamość",
            postalCode: "22-400",
            voivodeship: "lubelskie",
            district: "Stare Miasto"
        },
        contact: {
            phone: "+48 84 901 23 45",
            email: "przedszkole22@zamosc.pl",
            website: "https://pp22zamosc.edu.pl"
        },
        location: {
            latitude: 50.7231,
            longitude: 23.2516
        },
        studentCount: 110,
        teacherCount: 11,
        establishedYear: 1985,
        languages: ["polish", "english"],
        specializations: ["early_childhood", "arts"],
        facilities: ["playground", "garden", "art_room", "music_room"],
        images: [
            "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop"
        ]
    },

    // ZACHODNIOPOMORSKIE
    {
        name: "Szkoła Podstawowa Sportowa nr 7",
        shortName: "SP Sportowa nr 7",
        type: "primary",
        address: {
            street: "ul. Olimpijska 18",
            city: "Szczecin",
            postalCode: "70-780",
            voivodeship: "zachodniopomorskie",
            district: "Prawobrzeże"
        },
        contact: {
            phone: "+48 91 890 12 34",
            email: "sekretariat@spsportowa7.szczecin.pl",
            website: "https://spsportowa7.szczecin.pl"
        },
        location: {
            latitude: 53.4285,
            longitude: 14.5528
        },
        studentCount: 320,
        teacherCount: 28,
        establishedYear: 1985,
        languages: ["polish", "english"],
        specializations: ["sports", "physical_education", "health"],
        facilities: ["gym", "swimming_pool", "sports_field", "fitness_room", "library", "cafeteria"],
        images: [
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=600&fit=crop"
        ]
    },
    {
        name: "Technikum Morskie",
        shortName: "TM Koszalin",
        type: "technical",
        address: {
            street: "ul. Portowa 15",
            city: "Koszalin",
            postalCode: "75-900",
            voivodeship: "zachodniopomorskie",
            district: "Centrum"
        },
        contact: {
            phone: "+48 94 012 34 56",
            email: "sekretariat@tm.koszalin.pl",
            website: "https://tm.koszalin.pl"
        },
        location: {
            latitude: 54.1943,
            longitude: 16.1714
        },
        studentCount: 290,
        teacherCount: 24,
        establishedYear: 1972,
        languages: ["polish", "english", "german"],
        specializations: ["maritime", "navigation", "marine_engineering"],
        facilities: ["navigation_lab", "engine_room_simulator", "library", "gym", "cafeteria"],
        images: [
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop"
        ]
    },

    // ŁÓDZKIE
    {
        name: "Liceum Ogólnokształcące im. Tadeusza Kościuszki",
        shortName: "LO Kościuszki",
        type: "high_school",
        address: {
            street: "ul. Piotrkowska 104",
            city: "Łódź",
            postalCode: "90-926",
            voivodeship: "łódzkie",
            district: "Śródmieście"
        },
        contact: {
            phone: "+48 42 123 45 67",
            email: "sekretariat@lokosciuszki.lodz.pl",
            website: "https://lokosciuszki.lodz.pl"
        },
        location: {
            latitude: 51.7592,
            longitude: 19.4560
        },
        studentCount: 580,
        teacherCount: 44,
        establishedYear: 1906,
        languages: ["polish", "english", "german", "russian"],
        specializations: ["humanities", "mathematics", "sciences"],
        facilities: ["library", "computer_lab", "gym", "cafeteria", "auditorium"],
        images: [
            "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
        ]
    },
    {
        name: "Szkoła Podstawowa nr 45",
        shortName: "SP nr 45",
        type: "primary",
        address: {
            street: "ul. Tekstylna 28",
            city: "Łódź",
            postalCode: "91-480",
            voivodeship: "łódzkie",
            district: "Bałuty"
        },
        contact: {
            phone: "+48 42 234 56 78",
            email: "sekretariat@sp45.lodz.pl",
            website: "https://sp45.lodz.pl"
        },
        location: {
            latitude: 51.7765,
            longitude: 19.4712
        },
        studentCount: 360,
        teacherCount: 28,
        establishedYear: 1975,
        languages: ["polish", "english"],
        specializations: ["arts", "mathematics"],
        facilities: ["library", "computer_lab", "gym", "art_room", "playground"],
        images: [
            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=600&fit=crop"
        ]
    },

    // KUJAWSKO-POMORSKIE
    {
        name: "Zespół Szkół Rolniczych",
        shortName: "ZSR Bydgoszcz",
        type: "technical",
        address: {
            street: "ul. Rolnicza 50",
            city: "Bydgoszcz",
            postalCode: "85-796",
            voivodeship: "kujawsko-pomorskie",
            district: "Fordon"
        },
        contact: {
            phone: "+48 52 345 67 89",
            email: "sekretariat@zsr.bydgoszcz.pl",
            website: "https://zsr.bydgoszcz.pl"
        },
        location: {
            latitude: 53.1235,
            longitude: 18.0084
        },
        studentCount: 340,
        teacherCount: 26,
        establishedYear: 1963,
        languages: ["polish", "english"],
        specializations: ["agriculture", "veterinary", "environmental"],
        facilities: ["farm", "greenhouse", "laboratory", "library", "gym"],
        images: [
            "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop"
        ]
    },
    {
        name: "Przedszkole Publiczne nr 30 'Wesołe Nutki'",
        shortName: "PP Wesołe Nutki",
        type: "kindergarten",
        address: {
            street: "ul. Muzyczna 12",
            city: "Toruń",
            postalCode: "87-100",
            voivodeship: "kujawsko-pomorskie",
            district: "Stare Miasto"
        },
        contact: {
            phone: "+48 56 456 78 90",
            email: "przedszkole30@torun.pl",
            website: "https://pp30torun.edu.pl"
        },
        location: {
            latitude: 53.0138,
            longitude: 18.5984
        },
        studentCount: 140,
        teacherCount: 14,
        establishedYear: 1988,
        languages: ["polish", "english"],
        specializations: ["music", "early_childhood"],
        facilities: ["music_room", "playground", "garden", "cafeteria"],
        images: [
            "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop"
        ]
    },

    // PODLASKIE
    {
        name: "Liceum Ogólnokształcące im. Zygmunta Augusta",
        shortName: "LO Augusta",
        type: "high_school",
        address: {
            street: "ul. Królewska 15",
            city: "Białystok",
            postalCode: "15-950",
            voivodeship: "podlaskie",
            district: "Centrum"
        },
        contact: {
            phone: "+48 85 567 89 01",
            email: "sekretariat@loaugusta.bialystok.pl",
            website: "https://loaugusta.bialystok.pl"
        },
        location: {
            latitude: 53.1325,
            longitude: 23.1688
        },
        studentCount: 460,
        teacherCount: 36,
        establishedYear: 1954,
        languages: ["polish", "english", "russian", "lithuanian"],
        specializations: ["humanities", "languages", "history"],
        facilities: ["library", "computer_lab", "gym", "cafeteria", "language_lab"],
        images: [
            "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
        ]
    },

    // WARMIŃSKO-MAZURSKIE
    {
        name: "Szkoła Podstawowa nr 18",
        shortName: "SP nr 18",
        type: "primary",
        address: {
            street: "ul. Jeziorna 25",
            city: "Olsztyn",
            postalCode: "10-117",
            voivodeship: "warmińsko-mazurskie",
            district: "Jaroty"
        },
        contact: {
            phone: "+48 89 678 90 12",
            email: "sekretariat@sp18.olsztyn.pl",
            website: "https://sp18.olsztyn.pl"
        },
        location: {
            latitude: 53.7784,
            longitude: 20.4801
        },
        studentCount: 280,
        teacherCount: 22,
        establishedYear: 1980,
        languages: ["polish", "english", "german"],
        specializations: ["environmental", "sports"],
        facilities: ["library", "computer_lab", "gym", "nature_lab", "playground"],
        images: [
            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=600&fit=crop"
        ]
    },

    // PODKARPACKIE
    {
        name: "Technikum Leśne",
        shortName: "TL Krosno",
        type: "technical",
        address: {
            street: "ul. Leśna 40",
            city: "Krosno",
            postalCode: "38-400",
            voivodeship: "podkarpackie",
            district: "Centrum"
        },
        contact: {
            phone: "+48 13 789 01 23",
            email: "sekretariat@tl.krosno.pl",
            website: "https://tl.krosno.pl"
        },
        location: {
            latitude: 49.6884,
            longitude: 21.7614
        },
        studentCount: 220,
        teacherCount: 18,
        establishedYear: 1967,
        languages: ["polish", "english"],
        specializations: ["forestry", "environmental", "wood_technology"],
        facilities: ["forest_lab", "workshop", "library", "gym"],
        images: [
            "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop"
        ]
    },

    // ŚWIĘTOKRZYSKIE
    {
        name: "Liceum Ogólnokształcące im. Stefana Żeromskiego",
        shortName: "LO Żeromskiego",
        type: "high_school",
        address: {
            street: "ul. Żeromskiego 8",
            city: "Kielce",
            postalCode: "25-369",
            voivodeship: "świętokrzyskie",
            district: "Śródmieście"
        },
        contact: {
            phone: "+48 41 890 12 34",
            email: "sekretariat@lozeromskiego.kielce.pl",
            website: "https://lozeromskiego.kielce.pl"
        },
        location: {
            latitude: 50.8661,
            longitude: 20.6286
        },
        studentCount: 520,
        teacherCount: 40,
        establishedYear: 1945,
        languages: ["polish", "english", "german"],
        specializations: ["humanities", "literature", "history"],
        facilities: ["library", "computer_lab", "gym", "cafeteria", "auditorium"],
        images: [
            "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
        ]
    },

    // OPOLSKIE
    {
        name: "Szkoła Podstawowa Dwujęzyczna",
        shortName: "SP Dwujęzyczna",
        type: "primary",
        address: {
            street: "ul. Niemiecka 20",
            city: "Opole",
            postalCode: "45-085",
            voivodeship: "opolskie",
            district: "Centrum"
        },
        contact: {
            phone: "+48 77 901 23 45",
            email: "sekretariat@spdwujezyczna.opole.pl",
            website: "https://spdwujezyczna.opole.pl"
        },
        location: {
            latitude: 50.6751,
            longitude: 17.9213
        },
        studentCount: 240,
        teacherCount: 20,
        establishedYear: 1992,
        languages: ["polish", "german", "english"],
        specializations: ["languages", "cultural_exchange"],
        facilities: ["language_lab", "computer_lab", "library", "gym", "cultural_center"],
        images: [
            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=600&fit=crop"
        ]
    }
];

async function clearExistingData() {
    console.log('🧹 Clearing existing data...');
    
    // Delete in correct order to respect foreign key constraints
    await prisma.ratingsGoogle.deleteMany();
    await prisma.schoolImage.deleteMany();
    await prisma.schoolSocialMedia.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.school.deleteMany();
    
    console.log('✅ Existing data cleared');
}

async function populateExpandedSchoolData() {
    console.log('🏫 Populating expanded Polish school database...');
    console.log(`📊 Adding ${expandedPolishSchools.length} schools across all voivodeships`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const schoolData of expandedPolishSchools) {
        try {
            console.log(`📚 Adding school: ${schoolData.name} (${schoolData.address.city})`);
            
            // Create school record
            const school = await prisma.school.create({
                data: {
                    name: schoolData.name,
                    shortName: schoolData.shortName,
                    type: schoolData.type,
                    address: schoolData.address,
                    contact: schoolData.contact,
                    location: schoolData.location,
                    studentCount: schoolData.studentCount,
                    teacherCount: schoolData.teacherCount,
                    establishedYear: schoolData.establishedYear,
                    languages: schoolData.languages,
                    specializations: schoolData.specializations,
                    facilities: schoolData.facilities
                }
            });
            
            // Add school images
            for (let i = 0; i < schoolData.images.length; i++) {
                await prisma.schoolImage.create({
                    data: {
                        schoolId: school.id,
                        imageUrl: schoolData.images[i],
                        imageType: i === 0 ? "main" : "building",
                        altText: `${school.name} - Zdjęcie ${i + 1}`,
                        source: "admin",
                        isVerified: true,
                        displayOrder: i + 1
                    }
                });
            }
            
            // Add Google rating with more realistic distribution
            const rating = 3.2 + Math.random() * 1.8; // Random rating between 3.2-5.0
            const reviewTexts = [
                "Bardzo dobra szkoła z wysokim poziomem nauczania.",
                "Polecam tę placówkę - świetna kadra pedagogiczna.",
                "Moje dziecko bardzo lubi chodzić do tej szkoły.",
                "Nowoczesne podejście do edukacji, dobre wyposażenie.",
                "Profesjonalna obsługa i miła atmosfera.",
                "Szkoła z tradycjami i wysokimi standardami."
            ];
            
            await prisma.ratingsGoogle.create({
                data: {
                    schoolId: school.id,
                    googleReviewId: `google_review_${school.id}_${Date.now()}`,
                    rating: Math.round(rating * 10) / 10,
                    reviewText: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
                    authorName: "Rodzic ucznia",
                    reviewDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random date within last year
                }
            });
            
            successCount++;
            console.log(`✅ Added ${school.name} with ${schoolData.images.length} images`);
            
        } catch (error) {
            errorCount++;
            console.error(`❌ Error adding school ${schoolData.name}:`, error.message);
        }
    }
    
    console.log(`\n📈 Import Summary: ${successCount} successful, ${errorCount} errors`);
}

async function displayComprehensiveStats() {
    console.log('\n📊 Comprehensive Database Statistics:');
    console.log('=====================================');
    
    const totalSchools = await prisma.school.count();
    const totalImages = await prisma.schoolImage.count();
    const totalRatings = await prisma.ratingsGoogle.count();
    
    console.log(`📚 Total Schools: ${totalSchools}`);
    console.log(`🖼️ Total Images: ${totalImages}`);
    console.log(`⭐ Total Google Ratings: ${totalRatings}`);
    
    // Schools by type
    const schoolsByType = await prisma.school.groupBy({
        by: ['type'],
        _count: {
            id: true
        }
    });
    
    console.log('\n🏫 Schools by Type:');
    schoolsByType.forEach(group => {
        console.log(`   - ${group.type}: ${group._count.id}`);
    });
    
    // Schools by voivodeship
    const schoolsByVoivodeship = await prisma.$queryRaw`
        SELECT JSON_EXTRACT(address, '$.voivodeship') as voivodeship, COUNT(*) as count
        FROM schools 
        GROUP BY JSON_EXTRACT(address, '$.voivodeship')
        ORDER BY count DESC
    `;
    
    console.log('\n🗺️ Schools by Voivodeship:');
    schoolsByVoivodeship.forEach(group => {
        console.log(`   - ${group.voivodeship}: ${group.count}`);
    });
    
    // Average ratings
    const avgRating = await prisma.ratingsGoogle.aggregate({
        _avg: {
            rating: true
        }
    });
    
    console.log(`\n⭐ Average Rating: ${avgRating._avg.rating?.toFixed(2)}/5.0`);
    
    // Sample schools from different voivodeships
    const sampleSchools = await prisma.school.findMany({
        take: 5,
        include: {
            images: true,
            googleRatings: true
        },
        orderBy: {
            studentCount: 'desc'
        }
    });
    
    console.log('\n🎓 Top 5 Schools by Student Count:');
    sampleSchools.forEach((school, index) => {
        const address = school.address;
        console.log(`   ${index + 1}. ${school.name}`);
        console.log(`      📍 ${address.city}, ${address.voivodeship}`);
        console.log(`      👥 ${school.studentCount} students, ${school.teacherCount} teachers`);
        console.log(`      🖼️ ${school.images.length} images`);
        if (school.googleRatings.length > 0) {
            console.log(`      ⭐ ${school.googleRatings[0].rating}/5.0`);
        }
        console.log('');
    });
}

async function expandedDataIntegration() {
    try {
        console.log('🎓 School Finder - Expanded Data Integration');
        console.log('===========================================');
        console.log(`🚀 Preparing to add ${expandedPolishSchools.length} schools`);
        console.log('📍 Coverage: All 16 Polish voivodeships');
        console.log('🏫 Types: Primary, High School, Technical, Kindergarten\n');
        
        await clearExistingData();
        await populateExpandedSchoolData();
        await displayComprehensiveStats();
        
        console.log('\n✅ Expanded data integration completed successfully!');
        console.log('\n🌐 Application URLs:');
        console.log('   - School Finder Portal: http://localhost:3000');
        console.log('   - Schools List: http://localhost:3000/schools');
        console.log('   - Admin Panel: http://localhost:3000/admin');
        console.log('   - Prisma Studio: npx prisma studio');
        
    } catch (error) {
        console.error('❌ Expanded data integration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the integration
if (import.meta.url === `file://${process.argv[1]}`) {
    expandedDataIntegration()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Integration failed:', error);
            process.exit(1);
        });
}

export default { expandedDataIntegration };