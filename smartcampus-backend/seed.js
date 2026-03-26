require("dotenv").config();
const mongoose = require("mongoose");
const Resource = require("./models/Resource");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

const sampleResources = [
  {
    name: "Lecture Hall A101",
    type: "classroom",
    capacity: 100,
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800",
    description:
      "Modern lecture hall with projector, audio system, and comfortable seating for 100 students.",
    features: ["Projector", "Audio System", "Air Conditioning", "Whiteboard"],
    isAvailable: true,
  },
  {
    name: "Computer Lab B205",
    type: "lab",
    capacity: 50,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
    description:
      "High-performance computer lab with 50 workstations, dual monitors, and latest software.",
    features: [
      "50 Computers",
      "High-Speed Internet",
      "Software Suite",
      "Printing",
    ],
    isAvailable: true,
  },
  {
    name: "Basketball Court",
    type: "sports",
    capacity: 20,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    description:
      "Indoor basketball court with professional flooring and equipment.",
    features: ["Indoor Court", "Score Board", "Seating Area", "Equipment Room"],
    isAvailable: true,
  },
  {
    name: "Seminar Room C302",
    type: "classroom",
    capacity: 30,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    description:
      "Intimate seminar room perfect for group discussions and presentations.",
    features: ["Smart TV", "Conference Table", "Video Conferencing", "WiFi"],
    isAvailable: true,
  },
  {
    name: "Chemistry Lab D104",
    type: "lab",
    capacity: 40,
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800",
    description:
      "Well-equipped chemistry laboratory with modern instruments and safety equipment.",
    features: ["Lab Equipment", "Safety Gear", "Fume Hoods", "Storage"],
    isAvailable: true,
  },
  {
    name: "Tennis Court",
    type: "sports",
    capacity: 4,
    image: "https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800",
    description:
      "Professional tennis court with synthetic surface and lighting.",
    features: [
      "Synthetic Surface",
      "Night Lighting",
      "Net Equipment",
      "Seating",
    ],
    isAvailable: true,
  },
  {
    name: "Lecture Hall A203",
    type: "classroom",
    capacity: 150,
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",
    description:
      "Large auditorium-style classroom for major lectures and events.",
    features: ["Stage", "Microphone System", "Recording Equipment", "AC"],
    isAvailable: true,
  },
  {
    name: "Physics Lab E301",
    type: "lab",
    capacity: 35,
    image: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800",
    description:
      "Advanced physics laboratory with experimental equipment and workstations.",
    features: [
      "Experiment Stations",
      "Instruments",
      "Data Collection",
      "Safety Equipment",
    ],
    isAvailable: true,
  },
  {
    name: "Swimming Pool",
    type: "sports",
    capacity: 30,
    image: "https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800",
    description:
      "Olympic-size swimming pool with changing rooms and lifeguard.",
    features: ["Olympic Size", "Changing Rooms", "Lifeguard", "Lane Dividers"],
    isAvailable: true,
  },
  {
    name: "Meeting Room F101",
    type: "classroom",
    capacity: 20,
    image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800",
    description:
      "Professional meeting room for faculty and administrative meetings.",
    features: [
      "Conference Table",
      "Video Call Setup",
      "Whiteboard",
      "Coffee Station",
    ],
    isAvailable: true,
  },
  {
    name: "Biology Lab G202",
    type: "lab",
    capacity: 45,
    image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800",
    description: "Modern biology lab with microscopes and specimen storage.",
    features: [
      "Microscopes",
      "Specimen Storage",
      "Workbenches",
      "Safety Equipment",
    ],
    isAvailable: true,
  },
  {
    name: "Badminton Court",
    type: "sports",
    capacity: 8,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
    description: "Indoor badminton court with professional nets and flooring.",
    features: [
      "Professional Net",
      "Wooden Floor",
      "Equipment Storage",
      "Seating",
    ],
    isAvailable: true,
  },
  {
    name: "Tutorial Room D201",
    type: "classroom",
    capacity: 25,
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800",
    description:
      "Cozy tutorial room ideal for small group sessions and workshops.",
    features: [
      "Interactive Board",
      "Circular Seating",
      "WiFi",
      "Natural Light",
    ],
    isAvailable: true,
  },
  {
    name: "Auditorium Main Hall",
    type: "classroom",
    capacity: 500,
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
    description:
      "Grand auditorium for large events, conferences, and performances.",
    features: ["Stage Lighting", "Sound System", "Balcony", "Green Room"],
    isAvailable: true,
  },
  {
    name: "Conference Hall B301",
    type: "classroom",
    capacity: 80,
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
    description: "Professional conference hall with modern amenities.",
    features: [
      "Video Wall",
      "Recording",
      "Translation Booths",
      "Catering Area",
    ],
    isAvailable: true,
  },
  {
    name: "Study Room H105",
    type: "classroom",
    capacity: 15,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
    description: "Quiet study room perfect for group projects and discussions.",
    features: ["Whiteboards", "Comfortable Seating", "Power Outlets", "WiFi"],
    isAvailable: true,
  },
  {
    name: "Football Field",
    type: "sports",
    capacity: 50,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    description:
      "Full-size football field with artificial turf and floodlights.",
    features: ["Artificial Turf", "Goals", "Floodlights", "Dugouts"],
    isAvailable: true,
  },
  {
    name: "Volleyball Court",
    type: "sports",
    capacity: 12,
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800",
    description: "Indoor volleyball court with professional setup.",
    features: ["Professional Net", "Wooden Floor", "Score Board", "Seating"],
    isAvailable: true,
  },
  {
    name: "Fitness Center",
    type: "sports",
    capacity: 40,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
    description:
      "Modern fitness center with cardio and weight training equipment.",
    features: ["Cardio Equipment", "Free Weights", "Machines", "Lockers"],
    isAvailable: true,
  },
  {
    name: "Yoga Studio",
    type: "sports",
    capacity: 25,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
    description: "Peaceful yoga and meditation studio with natural lighting.",
    features: ["Yoga Mats", "Sound System", "Mirrors", "Storage"],
    isAvailable: true,
  },
  {
    name: "Cricket Ground",
    type: "sports",
    capacity: 60,
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
    description: "Professional cricket ground with practice nets.",
    features: ["Turf Pitch", "Practice Nets", "Pavilion", "Lighting"],
    isAvailable: true,
  },
  {
    name: "Electronics Lab H301",
    type: "lab",
    capacity: 40,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800",
    description:
      "Advanced electronics lab with circuit boards, oscilloscopes, and testing equipment.",
    features: [
      "Oscilloscopes",
      "Circuit Boards",
      "Testing Equipment",
      "Soldering Stations",
    ],
    isAvailable: true,
  },
  {
    name: "Mechanical Engineering Lab I201",
    type: "lab",
    capacity: 35,
    image: "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800",
    description:
      "Workshop with CNC machines, lathes, and mechanical testing equipment.",
    features: ["CNC Machines", "Lathes", "Testing Equipment", "Tool Storage"],
    isAvailable: true,
  },
  {
    name: "Language Lab J105",
    type: "lab",
    capacity: 30,
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800",
    description:
      "Modern language learning lab with audio-visual equipment and practice booths.",
    features: [
      "Audio Booths",
      "Headphones",
      "Recording Software",
      "Translation Tools",
    ],
    isAvailable: true,
  },
  {
    name: "Robotics Lab K202",
    type: "lab",
    capacity: 25,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
    description:
      "Cutting-edge robotics lab with robot kits, sensors, and AI development tools.",
    features: [
      "Robot Kits",
      "AI Software",
      "Sensors & Actuators",
      "Testing Arena",
    ],
    isAvailable: true,
  },
  {
    name: "Data Science Lab L301",
    type: "lab",
    capacity: 45,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
    description:
      "High-performance computing lab for data analysis, ML, and AI projects.",
    features: [
      "GPU Workstations",
      "Python/R Tools",
      "Big Data Software",
      "Visualization Tools",
    ],
    isAvailable: true,
  },
  {
    name: "Electrical Engineering Lab M104",
    type: "lab",
    capacity: 38,
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800",
    description:
      "Electrical engineering lab with power systems and control equipment.",
    features: [
      "Power Supplies",
      "Control Systems",
      "Measurement Tools",
      "Safety Gear",
    ],
    isAvailable: true,
  },
  {
    name: "Biotechnology Lab N203",
    type: "lab",
    capacity: 32,
    image: "https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=800",
    description:
      "Specialized biotech lab with cell culture facilities and genetic analysis tools.",
    features: [
      "Incubators",
      "PCR Machines",
      "Centrifuges",
      "Sterile Workspace",
    ],
    isAvailable: true,
  },
  {
    name: "3D Printing Lab O101",
    type: "lab",
    capacity: 20,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
    description:
      "Maker space with 3D printers, laser cutters, and prototyping equipment.",
    features: ["3D Printers", "Laser Cutter", "Design Software", "Materials"],
    isAvailable: true,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await Resource.deleteMany({});
    console.log("🗑️  Cleared existing resources");

    await Resource.insertMany(sampleResources);
    console.log(`✅ Added ${sampleResources.length} sample resources`);

    console.log("\n🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
