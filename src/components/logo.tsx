import React, { forwardRef } from "react";

const Logo = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  (props, ref) => {
    return (
      <svg
        ref={ref}
        width={props.width ?? "604"}
        height={props.height ?? "608"}
        viewBox="0 0 604 608"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          d="M98.9531 28H504C559.228 28 604 72.7715 604 128V485C604 540.228 559.228 585 504 585H100.155L90.1572 607.399L16.1875 599.554L0.791016 526.78L27 511.682V100.544L1.74609 88.748L10.8613 14.9238L83.8887 0.780273L98.9531 28ZM187.049 105.366L177.855 136.669L149.978 156.345L146 156.207V446.788L148.934 445.946L177.889 459.09L190.014 488.485L187.894 495H467C494.614 495 517 472.614 517 445V368C517 351.431 503.569 338 487 338H266V262C266 260.654 265.946 259.32 265.842 258H487C503.569 258 517 244.569 517 228V151C517 123.386 494.614 101 467 101H184.919L187.049 105.366Z"
          fill="none"
          stroke={props.color ?? "#e3e4d8"}
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
);

Logo.displayName = "Logo";

export default Logo;
