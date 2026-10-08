import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding OSINT.NG database...");

  // Seed admin user
  const adminHash = await bcrypt.hash("admin1234", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@osint.ng" },
    update: {},
    create: {
      ein: "EIN-000001",
      fullName: "Duty Officer Alpha",
      phone: "08000000001",
      email: "admin@osint.ng",
      passwordHash: adminHash,
    },
  });
  console.log(`✅ Admin user: ${admin.email} | EIN: ${admin.ein}`);

  // Seed demo user
  const userHash = await bcrypt.hash("user1234", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "citizen@osint.ng" },
    update: {},
    create: {
      ein: "EIN-482910",
      fullName: "Emeka Okafor",
      phone: "08034567890",
      email: "citizen@osint.ng",
      passwordHash: userHash,
    },
  });
  console.log(`✅ Demo user: ${demoUser.email} | EIN: ${demoUser.ein}`);

  // Seed public posts
  const postsData = [
    {
      authorName: "OSINT ANAMBRA",
      badge: "Authorities",
      sourceUrl: "https://npf.gov.ng",
      status: "Active Alert",
      title: "Armed Robbery & Vehicle Hijacking Alert along Nkwo Triangle",
      body: "Eyewitnesses reported an armed robbery incident targeting a commercial goods delivery transit along Old Market Road near Nkwo Nnewi Triangle. Joint patrol team dispatched. Motorists advised to maintain situational awareness.",
      location: "Nkwo Nnewi Triangle, Nnewi North LGA, Anambra State",
      state: "Anambra",
      lga: "Nnewi North",
      town: "Nkwo Nnewi Triangle",
      mediaUrl: "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?auto=format&fit=crop&w=800&q=80",
      isSensitive: true,
      isPushed: true,
    },
    {
      authorName: "OSINT ANAMBRA",
      badge: "Authorities",
      sourceUrl: "https://frsc.gov.ng",
      status: "Verified",
      title: "Night Travel Advisory & Heavy Erosion Gully on Nnewi-Ozubulu Route",
      body: "Severe road collapse and deep gully erosion at the Ozubulu bypass approach. Vehicles moving at crawl speed. Local vigilante checkpoints active.",
      location: "Ozubulu Bypass Junction, Nnewi South LGA, Anambra State",
      state: "Anambra",
      lga: "Nnewi South",
      town: "Ozubulu Bypass Junction",
      mediaUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80",
      isSensitive: false,
    },
    {
      authorName: "OSINT LAGOS",
      badge: "Authorities",
      sourceUrl: "https://lasema.lagosstate.gov.ng",
      status: "Active Alert",
      title: "Flash Flood Warning & River Surge in Progress",
      body: "Water levels have crossed critical capacity in Sector 4 Basin. Structural flooding reported along Riverfront Blvd. Emergency evacuation advised for basement-level properties.",
      location: "East Riverfront Basin, Lagos Island LGA, Lagos State",
      state: "Lagos",
      lga: "Lagos Island",
      town: "East Riverfront Basin",
      mediaUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
      isSensitive: false,
      isPushed: true,
    },
    {
      authorName: "OSINT ABUJA",
      badge: "News",
      sourceUrl: "https://punchng.com",
      status: "Dispatched",
      title: "Power Substation Explosion & Grid Outage",
      body: "Crowdsourced social streams confirm a transformer fire at Substation B. Traffic signals out along 5th & Main. First responders on scene.",
      location: "5th Avenue & Main Intersection, Abuja Municipal, FCT",
      state: "FCT - Abuja",
      lga: "Abuja Municipal",
      town: "5th Avenue & Main",
      mediaUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
      isSensitive: false,
    },
    {
      authorName: "OSINT RIVERS",
      badge: "Public",
      status: "Under Verification",
      title: "Unattended Hazardous Waste Containers",
      body: "Spotted 3 unmarked corroded barrels near the industrial park drainage line. Fluid leak detected on perimeter pavement.",
      location: "Industrial Park, Gate 2, Port Harcourt, Rivers State",
      state: "Rivers",
      lga: "Port Harcourt",
      town: "Industrial Park Gate 2",
      mediaUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80",
      isSensitive: false,
    },
  ];

  for (const p of postsData) {
    await prisma.post.create({ data: { ...p, authorId: demoUser.id } });
  }
  console.log(`✅ Seeded ${postsData.length} posts`);

  // Seed admin reports
  const adminReports = [
    {
      contact: "08034567890",
      category: "Violent Crime / Armed Robbery / Kidnapping",
      title: "Armed Robbery In Progress at Upper Iweka Flyover",
      source: "Authorities",
      body: "Armed squad of four suspects intercepted commuter shuttle bus at foot of Upper Iweka. Gunfire heard. Commuters and local vigilante in standoff.",
      location: "Upper Iweka, Onitsha South LGA, Anambra State",
      state: "Anambra",
      confirmations: 26,
      status: "Pending",
      mediaUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    },
    {
      contact: "emeka.okafor@gmail.com",
      category: "Road Accident / Highway Crash",
      title: "Multi-Vehicle Collision Along Lagos-Ibadan Expressway",
      source: "Authorities",
      body: "Articulated tanker collided with two private saloons around Kara Bridge axis. Heavy diesel spillage and severe outward traffic obstruction.",
      location: "Kara Bridge, Obafemi Owode LGA, Ogun State",
      state: "Ogun",
      confirmations: 43,
      status: "Pending",
      mediaUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    },
    {
      contact: "08129876543",
      category: "Missing Person",
      title: "Missing 14-Year-Old Student in Garki Area",
      source: "Public",
      body: "Last spotted wearing grey school uniform around Area 3 Junction after afternoon prep. Family has filed complaint with local police command.",
      location: "Area 3, Abuja Municipal, FCT",
      state: "FCT - Abuja",
      confirmations: 18,
      status: "Approved",
      bountyPaid: true,
    },
    {
      contact: "safety_watch_ph@yahoo.com",
      category: "Flooding / Natural Hazard",
      title: "Flash Flood Warning & River Overflow in Trans-Amadi",
      source: "Authorities",
      body: "Industrial canal breached retaining wall. Several workshops submerged with hazardous runoffs into main roadway.",
      location: "Trans-Amadi Industrial Layout, Port Harcourt, Rivers State",
      state: "Rivers",
      confirmations: 89,
      status: "Approved",
      bountyPaid: true,
    },
    {
      contact: "citizen_ibadan@gmail.com",
      category: "Major Traffic Gridlock / Road Blockage",
      title: "Fallen 40ft Container Blocking Iwo Road Underpass",
      source: "Public",
      body: "Container slipped from chassis while ascending ramp. Both lanes impassable. Traffic wardens diverting vehicles to expressway loop.",
      location: "Iwo Road Interchange, Ibadan North-East LGA, Oyo State",
      state: "Oyo",
      confirmations: 15,
      status: "Approved",
      bountyPaid: true,
    },
    {
      contact: "08099887766",
      category: "Fire / Industrial Hazard",
      title: "Sawmill Timber Fire Outbreak in Ebute Metta",
      source: "Authorities",
      body: "Dense smoke billowing from sawdust stacks. Lagos State Fire Service units mobilized.",
      location: "Ebute Metta, Lagos Mainland LGA, Lagos State",
      state: "Lagos",
      confirmations: 52,
      status: "Approved",
      bountyPaid: true,
    },
    {
      contact: "spurious_prank@fake.com",
      category: "Suspicious Activity / Security Advisory",
      title: "Unverified Rumor of Curfew Enforcement",
      source: "Public",
      body: "Broadcast claiming unauthorized curfew starting midnight. Local command confirmed zero curfew orders in effect.",
      location: "Enugu Urban, Enugu State",
      state: "Enugu",
      confirmations: 2,
      status: "Rejected",
    },
  ];

  for (const r of adminReports) {
    await prisma.adminReport.create({ data: r });
  }
  console.log(`✅ Seeded ${adminReports.length} admin reports`);

  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────────────");
  console.log("  Admin login:  admin@osint.ng / admin1234");
  console.log("  Demo login:   citizen@osint.ng / user1234");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
