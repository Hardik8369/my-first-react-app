import { GENRES } from '../genres.js'

const baseChip =
  'shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer'

const activeChip = 'bg-indigo-500 border-indigo-500 text-white'
const idleChip = 'bg-white/5 border-white/10 text-gray-100 hover:bg-white/10 hover:text-white'

const GenreChips = ({ selectedGenre, onSelect }) => {
  return (
    <div className="mt-6 max-w-4xl mx-auto w-full flex gap-3 overflow-x-auto hide-scrollbar pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible">
      <button
        onClick={() => onSelect(null)}
        className={`${baseChip} ${selectedGenre === null ? activeChip : idleChip}`}
      >
        All
      </button>

      {GENRES.map((genre) => (
        <button
          key={genre.id}
          onClick={() => onSelect(selectedGenre === genre.id ? null : genre.id)}
          className={`${baseChip} ${selectedGenre === genre.id ? activeChip : idleChip}`}
        >
          {genre.name}
        </button>
      ))}
    </div>
  )
}

export default GenreChips