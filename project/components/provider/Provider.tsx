
/* --- Base ------------------------------------------------------------------------------------- */
import { LANGUAGE_TYPE } from "@/project/config/site";
import { HeaderProvider } from "../theme/header/HeaderProvider";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Providers ---------------------------------------------------- */
export default function ProjectProvider({
  children,
  lang
}: Readonly<{
  children: React.ReactNode;
  lang: LANGUAGE_TYPE;
}>) {
  return (
    <>  
      <HeaderProvider lang={lang}>
        {children}
      </HeaderProvider>
    </>
  );
}

