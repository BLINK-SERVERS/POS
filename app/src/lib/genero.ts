// Género gramatical para la bienvenida, deducido del nombre de pila.
//
// El alta del POS no pregunta el género y no se le va a meter una pregunta más
// en el formulario por un saludo. Lo que sí se puede hacer es escribir bien la
// bienvenida cuando el nombre lo dice y NO adivinar cuando no lo dice: en ese
// caso el saludo de la primera vez cae en una fórmula sin marca de género.
//
// El marcador en español es la vocal final, con familias de excepciones que
// aquí están escritas, no inferidas: nombres terminados en consonante que son
// de mujer (los devocionales: Carmen, Soledad, Pilar, Dolores, Luz), nombres
// terminados en -o que también lo son (Consuelo, Rosario) y los de hombre que
// terminan en -e (Jorge, Vicente). Los terminados en
// -e, -i y -u están mezclados de verdad («José» / «Marlene» / «Noemí»), así que
// no se deciden, y los compuestos («María José», «José Luis») tampoco: el
// marcador suele estar en la segunda parte y aquí solo llega la primera.

/** Lo que sabe el POS del género de quien entra: lo deducible, o nada. */
export type Genero = "masculino" | "femenino" | "sin_dato";

/** De mujer aunque terminen en consonante, -e, -i o -u. */
const FEMENINAS = new Set([
  "carmen",
  "soledad",
  "pilar",
  "milagros",
  "dolores",
  "trinidad",
  "merced",
  "mercedes",
  "concepcion",
  "belen",
  "luz",
  "esther",
  "judit",
  "judith",
  "deborah",
  "noemi",
  "marlene",
  "isabel",
  "consuelo",
  "rosario",
  "refugio",
]);

/** De hombre aunque terminen en -e, donde la regla general no se atreve. */
const MASCULINOS = new Set(["jorge", "vicente"]);

/** Mezclados de verdad: mejor no decirlo. */
const AMBIGUOS = new Set(["andrea", "alex", "guadalupe", "cruz"]);

const sinMarcas = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

/** Lo que se alcanza a saber del género con solo el nombre de pila. */
export function generoDesdeNombre(nombre: string): Genero {
  const limpio = sinMarcas(nombre);
  if (!limpio) return "sin_dato";
  if (/\s/.test(limpio)) return "sin_dato";
  if (AMBIGUOS.has(limpio)) return "sin_dato";
  if (FEMENINAS.has(limpio)) return "femenino";
  if (MASCULINOS.has(limpio)) return "masculino";
  const ultima = limpio.slice(-1);
  if (ultima === "a") return "femenino";
  if (ultima === "o") return "masculino";
  if ("aeiou".includes(ultima)) return "sin_dato";
  // Consonante final: Luis, Jorge, Rafael, Juan, Miguel, Ramón. Un nombre que
  // no termina en letra (una tienda, un apodo escrito con números) no dice nada.
  if (!/[a-z]/.test(ultima)) return "sin_dato";
  return "masculino";
}

/** La palabra de la bienvenida, o `null` cuando no hay género seguro. */
export function terminoBienvenida(genero: Genero): "bienvenido" | "bienvenida" | null {
  if (genero === "sin_dato") return null;
  return genero === "masculino" ? "bienvenido" : "bienvenida";
}
