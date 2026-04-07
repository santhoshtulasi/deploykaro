import { PrismaClient, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Track 1: My First Deploy...");
  await prisma.track.upsert({
    where: { slug: "my-first-deploy" },
    update: {},
    create: {
      slug: "my-first-deploy",
      order: 1,
      durationHrs: 2,
      difficulty: Difficulty.BEGINNER,
      isPublished: true,
      titleEn: "My First Deploy",
      titleTa: "என் முதல் Deploy",
      modules: {
        create: [
          {
            order: 1,
            titleEn: "The Cloud Kitchen",
            concepts: {
              create: [
                { 
                  order: 1, 
                  titleEn: "What is a Server?", 
                  visualId: "vis_server_kitchen",
                  examDomains: ["SAA: Domain 1 (Resilient Architecture)"],
                  content: { analogy_en: "Kitchen server analogy.", technical_en: "Computing resource." }
                },
                { 
                  order: 2, 
                  titleEn: "What is the Cloud?", 
                  visualId: "vis_cloud_electricity",
                  examDomains: ["SAA: Domain 1 (Resilient Architecture)"],
                  content: { analogy_en: "Electricity analogy.", technical_en: "On-demand resources." }
                },
              ],
            },
          },
          {
            order: 2,
            titleEn: "The Docker Tiffin Box",
            concepts: {
              create: [
                { 
                  order: 1, 
                  titleEn: "What is Docker?", 
                  visualId: "vis_docker_tiffin",
                  examDomains: ["SAA: Domain 1", "CKA: Architecture"],
                  content: { analogy_en: "Tiffin box analogy.", technical_en: "Containerization." }
                },
                { 
                  order: 2, 
                  titleEn: "Your First Dockerfile", 
                  visualId: "vis_dockerfile",
                  examDomains: ["SAA: Domain 1", "CKA: Architecture"],
                  content: { analogy_en: "Recipe analogy.", technical_en: "Build instructions." }
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seeding Track 2: Orchestrating the Fleet...");
  await prisma.track.upsert({
    where: { slug: "orchestrating-the-fleet" },
    update: {},
    create: {
      slug: "orchestrating-the-fleet",
      order: 2,
      durationHrs: 4,
      difficulty: Difficulty.INTERMEDIATE,
      isPublished: true,
      titleEn: "Orchestrating the Fleet",
      titleTa: "கப்பற்படை ஒருங்கிணைப்பு",
      titleKn: "ನೌಕಾದಳದ ಸಮನ್ವಯ",
      modules: {
        create: [
          {
            order: 1,
            titleEn: "The Admiral's Command",
            titleTa: "அட்மிரல் கட்டளை",
            titleKn: "ಅಡ್ಮಿರಲ್ನ ಆಜ್ಞೆ",
            concepts: {
              create: [
                { 
                  order: 1, 
                  titleEn: "What is Kubernetes?", 
                  titleTa: "Kubernetes என்றால் என்ன?",
                  titleKn: "Kubernetes ಎಂದರೇನು?",
                  visualId: "vis_k8s_fleet",
                  examDomains: ["CKA: Cluster Architecture"],
                  content: { 
                    analogy_en: "Kubernetes is like a Fleet Admiral commanding an orchestrated fleet of ships.",
                    analogy_ta: "Kubernetes என்பது கப்பற்படையை கட்டளையிடும் ஒரு அட்மிரல் போன்றது.",
                    analogy_kn: "Kubernetes ಎಂಬುದು ನೌಕಾದಳವನ್ನು ಆಜ್ಞಾಪಿಸುವ ಅಡ್ಮಿರಲ್ ಇದ್ದಂತೆ.",
                    technical_en: "Kubernetes is an open-source container orchestration system for automating software deployment, scaling, and management."
                  }
                },
                { 
                  order: 2, 
                  titleEn: "Nodes & Pods", 
                  titleTa: "Nodes & Pods",
                  titleKn: "Nodes & Pods",
                  visualId: "vis_k8s_nodes",
                  examDomains: ["CKA: Cluster Architecture"],
                  content: {
                    analogy_en: "Nodes are the ships, and Pods are the tiffin boxes on those ships.",
                    analogy_ta: "Nodes என்பது கப்பல்கள், Pods என்பது அந்த கப்பலில் உள்ள டிபன் பாக்ஸ்கள்.",
                    analogy_kn: "Nodes ಎಂದರೆ ಹಡಗುಗಳು, ಮತ್ತು Pods ಎಂದರೆ ಆ ಹಡಗುಗಳಲ್ಲಿರುವ ಟಿಫಿನ್ ಬಾಕ್ಸ್ಗಳು.",
                    technical_en: "A Node is a worker machine. A Pod is the smallest execution unit in K8s, representing a group of containers."
                  }
                },
              ],
            },
          },
          {
            order: 2,
            titleEn: "Scaling the Concert",
            titleTa: "இசை நிகழ்ச்சியை விரிவுபடுத்துதல்",
            titleKn: "ಸಂಗೀತ ಕಾರ್ಯಕ್ರಮವನ್ನು ವಿಸ್ತರಿಸುವುದು",
            concepts: {
              create: [
                { 
                  order: 1, 
                  titleEn: "ReplicaSets & Scaling", 
                  titleTa: "ReplicaSets & விரிவுபடுத்தல்",
                  titleKn: "ReplicaSets & ವಿಸ್ತರಣೆ",
                  visualId: "vis_k8s_scaling",
                  examDomains: ["CKA: Workloads & Scheduling"],
                  content: {
                    analogy_en: "Scaling is like adding more speakers to a concert stage as the crowd Grows.",
                    analogy_ta: "Scaling என்பது கூட்டம் அதிகமாகும் போது மேடையில் கூடுதல் ஸ்பீக்கர்களை வைப்பது போன்றது.",
                    analogy_kn: "Scaling ಎಂದರೆ ಜನಜಂಗುಳಿ ಹೆಚ್ಚಾದಾಗ ವೇದಿಕೆಯಲ್ಲಿ ಹೆಚ್ಚಿನ ಸ್ಪೀಕರ್ಗಳನ್ನು ಸೇರಿಸಿದಂತೆ.",
                    technical_en: "ReplicaSets ensure that a specified number of pod replicas are running at any given time."
                  }
                },
                { 
                  order: 2, 
                  titleEn: "Self-Healing (The Phoenix)", 
                  titleTa: "தானாக சரிசெய்தல் (பீனிக்ஸ்)",
                  titleKn: "ಸ್ವಯಂ-ಗುಣಪಡಿಸುವಿಕೆ (ಫೀನಿಕ್ಸ್)",
                  visualId: "vis_k8s_healing",
                  examDomains: ["CKA: Troubleshooting"],
                  content: {
                    analogy_en: "Self-healing is like the Phoenix—if a pod dies, K8s brings it back from the ashes automatically.",
                    analogy_ta: "தானாக சரிசெய்தல் என்பது பீனிக்ஸ் பறவை போன்றது—ஒரு Pod அழிந்தால், K8s அதை தானாகவே மீண்டும் கொண்டு வரும்.",
                    analogy_kn: "ಸ್ವಯಂ-ಗುಣಪಡಿಸುವಿಕೆ ಎಂದರೆ ಫೀನಿಕ್ಸ್ ಹಕ್ಕಿಯಂತೆ—ಒಂದು Pod ನಾಶವಾದರೆ, K8s ಅದನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಮತ್ತೆ ಜೀವಂತಗೊಳಿಸುತ್ತದೆ.",
                    technical_en: "Liveness probes and restart policies allow K8s to automatically replace failed containers."
                  }
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seeding complete!");
}

main().catch((e) => { console.error(e); }).finally(() => prisma.$disconnect());
