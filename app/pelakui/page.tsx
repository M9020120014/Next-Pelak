import { UI as P } from "@/core/components/ui/Pelak"

export default function PelakUi() {
  return (
    <div className="py-080-A">

      Container

      <P.Container SectionClassName="bg-Success/40" className="bg-Warning/40">
        <div className="bg-Error/40">
          def container
        </div>
      </P.Container>


      <P.Container Padding="xl" Gaps="none">
        <div className="bg-Panel px-002-">
          def container
        </div>
        <div className="bg-Panel">
          def container
        </div>
      </P.Container>




    </div>
  )
}