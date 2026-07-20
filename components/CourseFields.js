// Shared by the instructor's Create Course and Edit Course pages — same
// fields either way, just prefilled with `course` on the edit form.
export default function CourseFields({ levels, course }) {
  return (
    <>
      <label className="text-xs uppercase tracking-widest text-ink/60">
        Title
        <input
          type="text"
          name="title"
          required
          defaultValue={course?.title ?? ""}
          className="block w-full border border-gold/40 bg-ivory px-3 py-2 text-sm mt-1 normal-case tracking-normal"
        />
      </label>
      <label className="text-xs uppercase tracking-widest text-ink/60">
        Style
        <input
          type="text"
          name="style"
          placeholder="Baladi, Veil Work, Drum Solo…"
          defaultValue={course?.style ?? ""}
          className="block w-full border border-gold/40 bg-ivory px-3 py-2 text-sm mt-1 normal-case tracking-normal"
        />
      </label>
      <label className="text-xs uppercase tracking-widest text-ink/60">
        Level
        <select
          name="level"
          defaultValue={course?.level ?? "Beginner"}
          className="block w-full border border-gold/40 bg-ivory px-3 py-2 text-sm mt-1 normal-case tracking-normal"
        >
          {levels.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </label>
      <div className="flex gap-3">
        <label className="text-xs uppercase tracking-widest text-ink/60 flex-1">
          Price ($)
          <input
            type="number"
            name="price"
            min="1"
            step="1"
            required
            defaultValue={course ? course.price_cents / 100 : ""}
            className="block w-full border border-gold/40 bg-ivory px-3 py-2 text-sm mt-1 normal-case tracking-normal"
          />
        </label>
        <label className="text-xs uppercase tracking-widest text-ink/60 flex-1">
          Was Price ($, optional)
          <input
            type="number"
            name="originalPrice"
            min="1"
            step="1"
            defaultValue={course?.original_price_cents ? course.original_price_cents / 100 : ""}
            className="block w-full border border-gold/40 bg-ivory px-3 py-2 text-sm mt-1 normal-case tracking-normal"
          />
        </label>
      </div>
      <label className="text-xs uppercase tracking-widest text-ink/60">
        Estimated Duration
        <input
          type="text"
          name="durationLabel"
          placeholder="6h 40m"
          defaultValue={course?.duration_label ?? ""}
          className="block w-full border border-gold/40 bg-ivory px-3 py-2 text-sm mt-1 normal-case tracking-normal"
        />
      </label>
      <label className="text-xs uppercase tracking-widest text-ink/60">
        Short Description
        <input
          type="text"
          name="description"
          defaultValue={course?.description ?? ""}
          className="block w-full border border-gold/40 bg-ivory px-3 py-2 text-sm mt-1 normal-case tracking-normal"
        />
      </label>
      <label className="text-xs uppercase tracking-widest text-ink/60">
        About This Course
        <textarea
          name="about"
          rows={5}
          defaultValue={course?.about ?? ""}
          className="block w-full border border-gold/40 bg-ivory px-3 py-2 text-sm mt-1 normal-case tracking-normal"
        />
      </label>
    </>
  );
}
