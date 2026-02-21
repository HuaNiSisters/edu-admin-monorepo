import { Location } from "../generated/prisma/enums.ts";
import { prisma } from "../src/lib/prisma.ts";

async function main() {
  // Create a new user with a post
  const user = await prisma.student.create({
    data: {
      first_name: "billy",
      last_name: "bob",
      email: "billy.bob@example.com",
      student_mobile: "123-456-7890",
      grade_at_school: 10,
      suburb_of_home: "Springfield",
      school: "Springfield High",
      location: Location.online,
    }});
  console.log("Created user:", user);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
