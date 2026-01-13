import { Category } from "@/types/channel";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
          selectedCategory === null
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
            : "glass-card hover:bg-muted"
        )}
      >
        সব দেখুন
      </button>
      
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-2",
            selectedCategory === category.id
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "glass-card hover:bg-muted"
          )}
        >
          <span>{category.icon}</span>
          <span>{category.name}</span>
          <span className="text-xs opacity-70">({category.channelCount})</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
