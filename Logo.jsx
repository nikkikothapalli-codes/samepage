import logoIcon from "./logo-icon.png";

export default function Logo({ href = "#/" }) {
  return (
    <a className="logo" href={href} aria-label="SamePage home">
      <img src={logoIcon} alt="" />
      <span>
        same<span className="logo-page">page</span>
      </span>
    </a>
  );
}
