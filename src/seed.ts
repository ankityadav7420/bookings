import { connectDb } from "./config/db";
import { Booking } from "./models/Booking";
import { Movie } from "./models/Movie";
import { Payment } from "./models/Payment";
import { SeatHold } from "./models/SeatHold";
import { SeatReservation } from "./models/SeatReservation";
import { Show } from "./models/Show";
import { Theater } from "./models/Theater";
import { User } from "./models/User";

const createSeats = () => {
  const rows = ["A", "B", "C", "D", "E", "F", "G"];
  return rows.flatMap((row, rowIndex) =>
    Array.from({ length: 12 }, (_value, index) => ({
      row,
      number: index + 1,
      type: rowIndex < 3 ? "gold" : rowIndex < 6 ? "platinum" : "recliner",
      isActive: !(row === "A" && [1, 12].includes(index + 1))
    }))
  );
};

const rebuildMovieIndexes = async () => {
  await Movie.collection.dropIndexes().catch((error) => {
    if (error.code !== 26 && error.codeName !== "NamespaceNotFound") {
      throw error;
    }
  });
  await Movie.syncIndexes();
};

const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60 * 1000);

const seed = async () => {
  await connectDb();
  await rebuildMovieIndexes();

  await Promise.all([
    Booking.deleteMany({}),
    Payment.deleteMany({}),
    SeatHold.deleteMany({}),
    SeatReservation.deleteMany({}),
    Show.deleteMany({}),
    Theater.deleteMany({}),
    Movie.deleteMany({}),
    User.deleteMany({})
  ]);

  const [admin, user, secondUser] = await User.create([
    {
      name: "Admin",
      email: "admin@example.com",
      mobile: "9999999999",
      password: "password123",
      role: "admin"
    },
    {
      name: "Demo User",
      email: "user@example.com",
      mobile: "8888888888",
      password: "password123",
      role: "user"
    },
    {
      name: "Priya Customer",
      email: "priya@example.com",
      mobile: "7777777777",
      password: "password123",
      role: "user"
    }
  ]);

  const movies = await Movie.insertMany([
    {
      title: "Metro Nights",
      description: "A fast-paced city drama built for a packed Friday night show.",
      durationMinutes: 142,
      language: "TELUGU",
      genres: ["Drama", "Thriller"],
      certificate: "UA",
      releaseDate: new Date("2026-05-10"),
      posterUrl: "https://example.com/posters/metro-nights.jpg",
      bannerUrl: "https://example.com/banners/metro-nights.jpg",
      trailerUrl: "https://example.com/trailers/metro-nights",
      cast: ["Asha Rao", "Kabir Mehta"],
      crew: [
        { name: "Neeraj Shah", role: "Director" },
        { name: "Ira Kapoor", role: "Music" }
      ],
      ratingAverage: 8.2,
      ratingCount: 1240,
      isTrending: true,
      isRecommended: true,
      status: "running",
      createdBy: admin._id
    },
    {
      title: "Skyline Heist",
      description: "A polished action thriller about a team racing against a citywide blackout.",
      durationMinutes: 128,
      language: "Hindi",
      genres: ["Action", "Crime"],
      certificate: "UA",
      releaseDate: new Date("2026-05-01"),
      posterUrl: "https://example.com/posters/skyline-heist.jpg",
      bannerUrl: "https://example.com/banners/skyline-heist.jpg",
      trailerUrl: "https://example.com/trailers/skyline-heist",
      cast: ["Rohan Malhotra", "Mira Sen"],
      crew: [
        { name: "Dev Mehra", role: "Director" },
        { name: "Sana Ali", role: "Writer" }
      ],
      ratingAverage: 7.8,
      ratingCount: 980,
      isTrending: true,
      isRecommended: true,
      status: "running",
      createdBy: admin._id
    },
    {
      title: "Coastal Love",
      description: "A warm romantic comedy set around a beachside music festival.",
      durationMinutes: 119,
      language: "Tamil",
      genres: ["Romance", "Comedy"],
      certificate: "U",
      releaseDate: new Date("2026-04-20"),
      posterUrl: "https://example.com/posters/coastal-love.jpg",
      bannerUrl: "https://example.com/banners/coastal-love.jpg",
      trailerUrl: "https://example.com/trailers/coastal-love",
      cast: ["Nila Krishnan", "Arjun Ravi"],
      crew: [
        { name: "Meera Iyer", role: "Director" },
        { name: "Karthik Rao", role: "Music" }
      ],
      ratingAverage: 7.4,
      ratingCount: 740,
      isTrending: false,
      isRecommended: true,
      status: "running",
      createdBy: admin._id
    },
    {
      title: "Code Red 2040",
      description: "A sci-fi mystery where an engineer uncovers a dangerous prediction engine.",
      durationMinutes: 151,
      language: "English",
      genres: ["Sci-Fi", "Mystery"],
      certificate: "A",
      releaseDate: new Date("2026-06-12"),
      posterUrl: "https://example.com/posters/code-red-2040.jpg",
      bannerUrl: "https://example.com/banners/code-red-2040.jpg",
      trailerUrl: "https://example.com/trailers/code-red-2040",
      cast: ["Evan Brooks", "Leah Stone"],
      crew: [
        { name: "Nora Hayes", role: "Director" },
        { name: "Theo Park", role: "Cinematographer" }
      ],
      ratingAverage: 0,
      ratingCount: 0,
      isTrending: false,
      isRecommended: false,
      status: "upcoming",
      createdBy: admin._id
    },
    {
      title: "Royal Run",
      description: "A sports drama about an underdog relay team preparing for a national final.",
      durationMinutes: 133,
      language: "Kannada",
      genres: ["Sports", "Drama"],
      certificate: "U",
      releaseDate: new Date("2026-06-25"),
      posterUrl: "https://example.com/posters/royal-run.jpg",
      bannerUrl: "https://example.com/banners/royal-run.jpg",
      trailerUrl: "https://example.com/trailers/royal-run",
      cast: ["Vikram Shetty", "Ananya Prasad"],
      crew: [
        { name: "Rahul Bhat", role: "Director" },
        { name: "Divya Nair", role: "Writer" }
      ],
      ratingAverage: 0,
      ratingCount: 0,
      isTrending: false,
      isRecommended: false,
      status: "upcoming",
      createdBy: admin._id
    },
    {
      title: "Desert Signal",
      description: "A survival thriller where a radio host follows a cryptic broadcast across the desert.",
      durationMinutes: 137,
      language: "Hindi",
      genres: ["Thriller", "Adventure"],
      certificate: "UA",
      releaseDate: new Date("2026-05-18"),
      posterUrl: "https://example.com/posters/desert-signal.jpg",
      bannerUrl: "https://example.com/banners/desert-signal.jpg",
      trailerUrl: "https://example.com/trailers/desert-signal",
      cast: ["Aditya Varma", "Sara Khan"],
      crew: [
        { name: "Nikhil Anand", role: "Director" },
        { name: "Pooja Menon", role: "Writer" }
      ],
      ratingAverage: 8.0,
      ratingCount: 860,
      isTrending: true,
      isRecommended: true,
      status: "running",
      createdBy: admin._id
    },
    {
      title: "Monsoon Cafe",
      description: "A feel-good drama about three friends rebuilding an old cafe during the first rains.",
      durationMinutes: 124,
      language: "Malayalam",
      genres: ["Drama", "Family"],
      certificate: "U",
      releaseDate: new Date("2026-05-15"),
      posterUrl: "https://example.com/posters/monsoon-cafe.jpg",
      bannerUrl: "https://example.com/banners/monsoon-cafe.jpg",
      trailerUrl: "https://example.com/trailers/monsoon-cafe",
      cast: ["Anu Joseph", "Mathew Kurian"],
      crew: [
        { name: "Leena Thomas", role: "Director" },
        { name: "Arun Jose", role: "Music" }
      ],
      ratingAverage: 7.9,
      ratingCount: 620,
      isTrending: false,
      isRecommended: true,
      status: "running",
      createdBy: admin._id
    },
    {
      title: "North Stand",
      description: "A football rivalry turns into a story of loyalty, friendship, and one impossible final.",
      durationMinutes: 139,
      language: "English",
      genres: ["Sports", "Drama"],
      certificate: "UA",
      releaseDate: new Date("2026-05-08"),
      posterUrl: "https://example.com/posters/north-stand.jpg",
      bannerUrl: "https://example.com/banners/north-stand.jpg",
      trailerUrl: "https://example.com/trailers/north-stand",
      cast: ["Liam Carter", "Noah Reed"],
      crew: [
        { name: "Ava Collins", role: "Director" },
        { name: "Mason Lee", role: "Writer" }
      ],
      ratingAverage: 7.7,
      ratingCount: 540,
      isTrending: false,
      isRecommended: true,
      status: "running",
      createdBy: admin._id
    },
    {
      title: "Velvet Dossier",
      description: "An investigative journalist enters the luxury art world to expose a dangerous forgery ring.",
      durationMinutes: 131,
      language: "Hindi",
      genres: ["Mystery", "Crime"],
      certificate: "A",
      releaseDate: new Date("2026-05-21"),
      posterUrl: "https://example.com/posters/velvet-dossier.jpg",
      bannerUrl: "https://example.com/banners/velvet-dossier.jpg",
      trailerUrl: "https://example.com/trailers/velvet-dossier",
      cast: ["Tara Sharma", "Kunal Roy"],
      crew: [
        { name: "Rhea Sood", role: "Director" },
        { name: "Kabir Sethi", role: "Cinematographer" }
      ],
      ratingAverage: 8.4,
      ratingCount: 1120,
      isTrending: true,
      isRecommended: true,
      status: "running",
      createdBy: admin._id
    },
    {
      title: "The Last Local",
      description: "A late-night Mumbai train becomes the stage for a funny, tense, and emotional journey home.",
      durationMinutes: 116,
      language: "Marathi",
      genres: ["Comedy", "Drama"],
      certificate: "U",
      releaseDate: new Date("2026-05-05"),
      posterUrl: "https://example.com/posters/the-last-local.jpg",
      bannerUrl: "https://example.com/banners/the-last-local.jpg",
      trailerUrl: "https://example.com/trailers/the-last-local",
      cast: ["Sagar Patil", "Mrunal Desai"],
      crew: [
        { name: "Nandita Kale", role: "Director" },
        { name: "Omkar Naik", role: "Writer" }
      ],
      ratingAverage: 7.6,
      ratingCount: 410,
      isTrending: false,
      isRecommended: true,
      status: "running",
      createdBy: admin._id
    },
    {
      title: "Orbit 9",
      description: "A rescue crew approaches a silent space station and discovers a countdown no one started.",
      durationMinutes: 148,
      language: "English",
      genres: ["Sci-Fi", "Thriller"],
      certificate: "UA",
      releaseDate: new Date("2026-07-04"),
      posterUrl: "https://example.com/posters/orbit-9.jpg",
      bannerUrl: "https://example.com/banners/orbit-9.jpg",
      trailerUrl: "https://example.com/trailers/orbit-9",
      cast: ["Iris Cole", "Daniel Wu"],
      crew: [
        { name: "Mina Park", role: "Director" },
        { name: "Owen Bell", role: "Writer" }
      ],
      ratingAverage: 0,
      ratingCount: 0,
      isTrending: false,
      isRecommended: false,
      status: "upcoming",
      createdBy: admin._id
    }
  ]);

  const theaters = await Theater.insertMany([
    {
      name: "Galaxy Cinemas",
      city: "Mumbai",
      address: "Andheri West, Mumbai",
      location: { latitude: 19.1363, longitude: 72.8277 },
      facilities: ["Parking", "Food Court", "Dolby Atmos"],
      screens: [
        { name: "Screen 1", seats: createSeats() },
        { name: "Screen 2", seats: createSeats() }
      ],
      createdBy: admin._id
    },
    {
      name: "Prasads Multiplex",
      city: "Hyderabad",
      address: "Necklace Road, Hyderabad",
      location: { latitude: 17.4239, longitude: 78.4738 },
      facilities: ["IMAX", "Parking", "Cafe"],
      screens: [
        { name: "Screen 1", seats: createSeats() },
        { name: "Screen 3", seats: createSeats() }
      ],
      createdBy: admin._id
    },
    {
      name: "Orion Cineplex",
      city: "Bengaluru",
      address: "Rajajinagar, Bengaluru",
      location: { latitude: 13.0108, longitude: 77.5558 },
      facilities: ["Parking", "Food Court", "Recliner Lounge"],
      screens: [
        { name: "Audi 1", seats: createSeats() },
        { name: "Audi 2", seats: createSeats() }
      ],
      createdBy: admin._id
    },
    {
      name: "Sathyam Screens",
      city: "Chennai",
      address: "Royapettah, Chennai",
      location: { latitude: 13.0553, longitude: 80.2570 },
      facilities: ["Dolby Atmos", "Cafe", "Parking"],
      screens: [
        { name: "Screen 1", seats: createSeats() },
        { name: "Screen 2", seats: createSeats() }
      ],
      createdBy: admin._id
    },
    {
      name: "Miraj Cinemas",
      city: "Pune",
      address: "Kothrud, Pune",
      location: { latitude: 18.5074, longitude: 73.8077 },
      facilities: ["Parking", "Food Court", "Recliners"],
      screens: [
        { name: "Audi 1", seats: createSeats() },
        { name: "Audi 2", seats: createSeats() }
      ],
      createdBy: admin._id
    },
    {
      name: "Cinepolis Seasons",
      city: "Pune",
      address: "Magarpatta, Pune",
      location: { latitude: 18.5185, longitude: 73.9348 },
      facilities: ["M-ticket", "Cafe", "Parking"],
      screens: [
        { name: "Screen 4", seats: createSeats() },
        { name: "Screen 5", seats: createSeats() }
      ],
      createdBy: admin._id
    },
    {
      name: "PVR Select City",
      city: "Delhi",
      address: "Saket, Delhi",
      location: { latitude: 28.5286, longitude: 77.2192 },
      facilities: ["IMAX", "Food Court", "Parking"],
      screens: [
        { name: "Audi 3", seats: createSeats() },
        { name: "Audi 4", seats: createSeats() }
      ],
      createdBy: admin._id
    },
    {
      name: "INOX Quest",
      city: "Kolkata",
      address: "Ballygunge, Kolkata",
      location: { latitude: 22.5380, longitude: 88.3657 },
      facilities: ["Parking", "Cafe", "Laser Projection"],
      screens: [
        { name: "Screen 1", seats: createSeats() },
        { name: "Screen 2", seats: createSeats() }
      ],
      createdBy: admin._id
    },
    {
      name: "AMB Cinemas",
      city: "Hyderabad",
      address: "Gachibowli, Hyderabad",
      location: { latitude: 17.4401, longitude: 78.3489 },
      facilities: ["Premium Lounge", "Parking", "Dolby Atmos"],
      screens: [
        { name: "Audi 1", seats: createSeats() },
        { name: "Audi 2", seats: createSeats() }
      ],
      createdBy: admin._id
    }
  ]);

  const runningMovies = movies.filter((movie) => movie.status === "running");
  const now = new Date();
  const showTimes = [11, 15, 19, 22];
  const showsPayload = theaters.flatMap((theater, theaterIndex) =>
    theater.screens.flatMap((screen, screenIndex) =>
      runningMovies.flatMap((movie, movieIndex) =>
        [1, 2, 3].flatMap((dayOffset) =>
          showTimes.map((hour, slotIndex) => {
            const startsAt = new Date(now);
            startsAt.setDate(now.getDate() + dayOffset);
            startsAt.setHours(hour, slotIndex === 3 ? 15 : 0, 0, 0);

            return {
              movie: movie._id,
              theater: theater._id,
              screenName: screen.name,
              startsAt,
              endsAt: addMinutes(startsAt, movie.durationMinutes),
              prices: [
                { seatType: "gold", price: 180 + theaterIndex * 20 + movieIndex * 10 },
                { seatType: "platinum", price: 280 + theaterIndex * 25 + movieIndex * 10 },
                { seatType: "recliner", price: 450 + theaterIndex * 30 + movieIndex * 20 }
              ],
              createdBy: admin._id
            };
          })
        )
      )
    )
  );

  const shows = await Show.insertMany(showsPayload);

  console.log("Seed complete");
  console.log({
    admin: admin.email,
    users: [user.email, secondUser.email],
    password: "password123",
    movies: movies.length,
    theaters: theaters.length,
    shows: shows.length
  });
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
