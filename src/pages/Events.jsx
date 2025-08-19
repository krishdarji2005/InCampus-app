import React from "react";
import styles from "./Events.module.css";
import EventCard from "../components/card/EventCard";
import { FixedSizeGrid as Grid } from "react-window";
// import { GridBackground } from "../background/GridBackground/GridBackground";
const CARD_WIDTH = 380; // px, matches .card max-width
const CARD_HEIGHT = 110; // px, estimated height
const GUTTER = 24; // px, matches grid gap

const Events = () => {
  const events = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1612831666989-bc3e0463a6ec?w=400&q=60",
      date: "Mar 12, 2024",
      readTime: "5 min",
      title:
        "Powerful Ads, Bigger Results: Elevate Your Brand in a Single Line!",
      author: "John Smith",
      authorImage: "https://i.pravatar.cc/24?img=8",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=60",
      date: "Mar 15, 2024",
      readTime: "10 min",
      title: "Tech Symposium: Future of AI in Education",
      author: "Sarah Johnson",
      authorImage: "https://i.pravatar.cc/24?img=11",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&q=60",
      date: "Mar 18, 2024",
      readTime: "7 min",
      title: "Creative Writing Workshop for Beginners",
      author: "Michael Chen",
      authorImage: "https://i.pravatar.cc/24?img=3",
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=60",
      date: "Mar 21, 2024",
      readTime: "6 min",
      title: "How to Build a Personal Brand Online",
      author: "Emily Davis",
      authorImage: "https://i.pravatar.cc/24?img=5",
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400&q=60",
      date: "Mar 24, 2024",
      readTime: "8 min",
      title: "Sustainable Innovation: A Green Tech Panel Discussion",
      author: "David Lee",
      authorImage: "https://i.pravatar.cc/24?img=6",
    },
    {
      id: 6,
      image:
        "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=400&q=60",
      date: "Mar 27, 2024",
      readTime: "5 min",
      title: "Freelancing 101: Start Earning on Your Own Terms",
      author: "Anna White",
      authorImage: "https://i.pravatar.cc/24?img=7",
    },
    {
      id: 7,
      image:
        "https://images.unsplash.com/photo-1559027615-9d9d798b1e31?w=400&q=60",
      date: "Mar 30, 2024",
      readTime: "9 min",
      title: "UI/UX Meetup: Designing for the Next Billion Users",
      author: "Carlos Mendes",
      authorImage: "https://i.pravatar.cc/24?img=9",
    },
    {
      id: 8,
      image:
        "https://images.unsplash.com/photo-1581091012184-e9d9e1ff0f85?w=400&q=60",
      date: "Apr 2, 2024",
      readTime: "4 min",
      title: "Startup Pitch Night: Battle of Ideas",
      author: "Riya Kapoor",
      authorImage: "https://i.pravatar.cc/24?img=10",
    },
    {
      id: 9,
      image:
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&q=60",
      date: "Apr 5, 2024",
      readTime: "6 min",
      title: "Campus Coding Jam: 24-Hour Hackathon Recap",
      author: "Mohit Singh",
      authorImage: "https://i.pravatar.cc/24?img=12",
    },
    {
      id: 10,
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=60",
      date: "Apr 7, 2024",
      readTime: "7 min",
      title: "Design Thinking Bootcamp: What We Learned",
      author: "Lara Brown",
      authorImage: "https://i.pravatar.cc/24?img=13",
    },
    {
      id: 11,
      image:
        "https://images.unsplash.com/photo-1485217988980-11786ced9454?w=400&q=60",
      date: "Apr 10, 2024",
      readTime: "3 min",
      title: "Photography Walk: Capturing Campus Life",
      author: "Tanmay Rao",
      authorImage: "https://i.pravatar.cc/24?img=14",
    },
    {
      id: 12,
      image:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=60",
      date: "Apr 12, 2024",
      readTime: "5 min",
      title: "Cybersecurity 101: Staying Safe Online",
      author: "Aisha Malik",
      authorImage: "https://i.pravatar.cc/24?img=15",
    },
    {
      id: 13,
      image:
        "https://images.unsplash.com/photo-1573164713347-df1e93c4f943?w=400&q=60",
      date: "Apr 15, 2024",
      readTime: "8 min",
      title: "Women in Tech: Voices from the Frontline",
      author: "Priya Desai",
      authorImage: "https://i.pravatar.cc/24?img=16",
    },
    {
      id: 14,
      image:
        "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&q=60",
      date: "Apr 18, 2024",
      readTime: "6 min",
      title: "Game Development Night: Student Projects Showcase",
      author: "Ethan Clark",
      authorImage: "https://i.pravatar.cc/24?img=17",
    },
    {
      id: 15,
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=60",
      date: "Apr 20, 2024",
      readTime: "4 min",
      title: "Music & Coding: A Fusion Workshop",
      author: "Sneha Iyer",
      authorImage: "https://i.pravatar.cc/24?img=18",
    },
    {
      id: 16,
      image:
        "https://images.unsplash.com/photo-1513569771920-bf57b838eced?w=400&q=60",
      date: "Apr 23, 2024",
      readTime: "10 min",
      title: "Startup Funding Secrets: Fireside Chat with Investors",
      author: "Arjun Mehta",
      authorImage: "https://i.pravatar.cc/24?img=19",
    },
    {
      id: 17,
      image:
        "https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=400&q=60",
      date: "Apr 25, 2024",
      readTime: "5 min",
      title: "Chess + AI: Intelligent Strategies Explained",
      author: "Neha Verma",
      authorImage: "https://i.pravatar.cc/24?img=20",
    },
    {
      id: 18,
      image:
        "https://images.unsplash.com/photo-1603570412205-8b7421c5cdff?w=400&q=60",
      date: "Apr 28, 2024",
      readTime: "9 min",
      title: "Robotics Fair 2024: Highlights & Innovations",
      author: "Kunal Patil",
      authorImage: "https://i.pravatar.cc/24?img=21",
    },
    {
      id: 19,
      image:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=60",
      date: "May 1, 2024",
      readTime: "7 min",
      title: "From Idea to App: Student Startup Journeys",
      author: "Aarav Bansal",
      authorImage: "https://i.pravatar.cc/24?img=22",
    },
    {
      id: 20,
      image:
        "https://images.unsplash.com/photo-1596079890741-8d3d0bb09d47?w=400&q=60",
      date: "May 4, 2024",
      readTime: "6 min",
      title: "TEDxYouth: Empowering Stories from Young Innovators",
      author: "Meera Joshi",
      authorImage: "https://i.pravatar.cc/24?img=23",
    },
  ];

  // Responsive columns
  const getColumnCount = () => {
    if (typeof window === "undefined") return 1;
    if (window.innerWidth < 480) return 1;
    if (window.innerWidth < 900) return 2;
    if (window.innerWidth < 1200) return 3;
    return 4;
  };
  const [columnCount, setColumnCount] = React.useState(getColumnCount());
  React.useEffect(() => {
    const handleResize = () => setColumnCount(getColumnCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rowCount = Math.ceil(events.length / columnCount);
  const useVirtual = events.length > 8;

  // Cell renderer for react-window Grid
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const idx = rowIndex * columnCount + columnIndex;
    if (idx >= events.length) return null;
    return (
      <div
        style={{
          ...style,
          left: style.left + GUTTER / 2,
          top: style.top + GUTTER / 2,
        }}
      >
        <EventCard key={events[idx].id} event={events[idx]} />
      </div>
    );
  };

  return (
    <div className={styles.eventsContainer}>
      <div className={styles.eventsContent}>
        <div className={styles.eventsTextContent}>
          <h2 className={styles.eventsTitle}>Discover Campus Events</h2>
          <p className={styles.eventsDescription}>
            Explore all upcoming campus events in one place, posted directly by
            your college committees.
          </p>
        </div>
        <div className={styles.eventsCardsContent}>
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;
