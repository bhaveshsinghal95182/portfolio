type ArrowTopRight2Props = {
  size: string;
};

const ArrowTopRight2 = ({ size }: ArrowTopRight2Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M16 16V8H8"
    />
  </svg>
);

export default ArrowTopRight2;
