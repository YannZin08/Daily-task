/** @type {const} */
const themeColors = {
  primary:    { light: '#8A05BE', dark: '#B347E8' },   // roxo (estilo Nubank)
  primaryDeep:{ light: '#4A0072', dark: '#5B0F8A' },   // roxo profundo (gradiente do cartão)
  secondary:  { light: '#A855F7', dark: '#C084FC' },   // roxo mais claro
  background: { light: '#FAFAFA', dark: '#0F0E13' },   // quase branco / preto suave
  surface:    { light: '#FFFFFF', dark: '#1B1A21' },   // card bg
  surface2:   { light: '#F3E8FF', dark: '#241F2E' },   // elevated surface
  foreground: { light: '#1A1523', dark: '#F2EFF7' },
  muted:      { light: '#79758A', dark: '#8B879C' },
  border:     { light: '#EDE7F5', dark: '#2A2733' },
  success:    { light: '#00A651', dark: '#22C55E' },   // verde (estilo Ailos)
  warning:    { light: '#F5A623', dark: '#FBBF24' },
  error:      { light: '#E5484D', dark: '#F87171' },
  accent:     { light: '#00A651', dark: '#22C55E' },   // verde de destaque (Ailos)
};

module.exports = { themeColors };
