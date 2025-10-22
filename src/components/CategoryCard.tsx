import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  onClick: () => void;
  isActive?: boolean;
}

export const CategoryCard = ({ icon: Icon, title, onClick, isActive }: CategoryCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        group relative cursor-pointer rounded-xl p-6 border
        transition-all duration-300 hover:scale-[1.03]
        ${isActive 
          ? 'bg-primary text-primary-foreground shadow-lg border-primary' 
          : 'bg-card hover:shadow-elegant border-border/50 hover:border-primary/30'
        }
        transform hover:-translate-y-1
        animate-fade-in
      `}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className={`
          p-3 rounded-full transition-all duration-500
          ${isActive ? 'bg-white/20' : 'bg-primary/10 group-hover:bg-primary/20'}
          transform group-hover:rotate-12 group-hover:scale-110
        `}>
          <Icon className={`w-8 h-8 ${isActive ? 'text-white' : 'text-primary'}`} />
        </div>
        <h3 className={`text-base font-semibold text-center ${isActive ? 'text-white' : 'text-foreground'}`}>
          {title}
        </h3>
      </div>
      
      {/* 3D effect shadow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl transform translate-y-2" />
    </div>
  );
};
