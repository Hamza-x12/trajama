import zelligeCorner from "@/assets/zellige-corner.png";

interface ZelligeCornersProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  opacity?: number;
}

const sizeMap = {
  sm: "w-16 h-16 sm:w-20 sm:h-20",
  md: "w-20 h-20 sm:w-28 sm:h-28",
  lg: "w-28 h-28 sm:w-36 sm:h-36"
};

export const ZelligeCorners = ({ 
  className = "", 
  size = "md",
  opacity = 0.4 
}: ZelligeCornersProps) => {
  return (
    <>
      {/* Top Left */}
      <img 
        src={zelligeCorner} 
        alt="" 
        className={`fixed top-0 left-0 ${sizeMap[size]} pointer-events-none z-0 ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      />
      
      {/* Top Right */}
      <img 
        src={zelligeCorner} 
        alt="" 
        className={`fixed top-0 right-0 ${sizeMap[size]} pointer-events-none z-0 -scale-x-100 ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      />
      
      {/* Bottom Left */}
      <img 
        src={zelligeCorner} 
        alt="" 
        className={`fixed bottom-0 left-0 ${sizeMap[size]} pointer-events-none z-0 -scale-y-100 ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      />
      
      {/* Bottom Right */}
      <img 
        src={zelligeCorner} 
        alt="" 
        className={`fixed bottom-0 right-0 ${sizeMap[size]} pointer-events-none z-0 -scale-x-100 -scale-y-100 ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      />
    </>
  );
};

export default ZelligeCorners;
