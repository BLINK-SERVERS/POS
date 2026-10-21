import { Composition } from "remotion";
import { Comercial } from "./composiciones/Comercial";
import { Prueba } from "./composiciones/Prueba";

/**
 * Las composiciones del comercial.
 *
 * · `Comercial`  -> la pieza final (el guion llega aqui).
 * · `Prueba`     -> banco de pruebas de movimiento: sirve para validar
 *                    springs, cristal, simbolos y tipografia de un golpe.
 */
export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Prueba"
        component={Prueba}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Comercial"
        component={Comercial}
        durationInFrames={2670}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
