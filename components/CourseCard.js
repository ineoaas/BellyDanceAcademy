import Link from "next/link";

export default function CourseCard({ course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="bg-ivory border border-gold/35 flex flex-col transition-all hover:-translate-y-1 hover:border-gold hover:shadow-lg hover:shadow-burgundy/10"
    >
      <div className="aspect-[16/10] bg-burgundy-deep relative flex items-center justify-center">
        <span className="font-display text-6xl text-gold/40">{course.letter}</span>
        <span className="absolute top-3 right-3 bg-gold text-burgundy-deep text-xs font-semibold px-3 py-1">
          ${course.price}
        </span>
        <span className="absolute bottom-3 left-3 text-[0.6rem] uppercase tracking-widest text-gold-light border border-gold px-2 py-1">
          {course.level}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="italic font-display text-sm text-ink/60 mb-1">{course.instructor}</div>
        <h3 className="font-display text-lg mb-1">{course.title}</h3>
        <p className="text-sm text-ink/60 flex-1">{course.desc}</p>
        <div className="flex justify-between text-xs text-ink/60 mt-4 pt-3 border-t border-dotted border-gold/50">
          <span className="text-gold tracking-wide">{course.rating}</span>
          <span>{course.lessons} lessons</span>
          <span>{course.duration}</span>
        </div>
      </div>
    </Link>
  );
}
