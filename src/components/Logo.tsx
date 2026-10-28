export default function Logo() {
  return (
    <div className="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 64 64" role="presentation">
        <g transform="translate(32 32)">
          <g fill="#B65C42">
            <ellipse cx="0" cy="-12" rx="6.6" ry="9.6" />
            <ellipse cx="0" cy="-12" rx="6.6" ry="9.6" transform="rotate(60)" />
            <ellipse cx="0" cy="-12" rx="6.6" ry="9.6" transform="rotate(120)" />
            <ellipse cx="0" cy="-12" rx="6.6" ry="9.6" transform="rotate(180)" />
            <ellipse cx="0" cy="-12" rx="6.6" ry="9.6" transform="rotate(240)" />
            <ellipse cx="0" cy="-12" rx="6.6" ry="9.6" transform="rotate(300)" />
          </g>
          <circle r="5.2" fill="#F6EEDF" />
          <circle r="2.1" fill="#6E4A34" opacity=".45" />
        </g>
      </svg>
    </div>
  )
}
