import { Icon } from "@/core/components/ui/Icon"
import { UI as P } from "@/core/components/ui/Pelak"

export default function MockUiPage() {
  return (
    <main className="bg-Background">
      <div className="h-400-I bg-Secondary max-w-7xl mx-auto flex justify-center items-center" >
        BLOG
      </div>


      <P.Container>
        <P.Card>
          <P.CardHeader className="flex flex-row items-center gap-012-3 bg-Primary/10">
          <P.Icon Icon="dashboard" className="text-Primary" />
            <h2>ماموریت ها</h2>
            
          </P.CardHeader>
          <P.CardContent className="flex flex-col gap-012-3">
            <P.Card>
              <P.CardContent className="flex flex-row items-center justify-between gap-012-3">
              <p>آزمون تستی روایت حقیقت شماره ۱</p>
              <P.Button Theme="primary">شروع</P.Button>
              </P.CardContent>
            </P.Card>
            <P.Card>
              <P.CardContent className="flex flex-row items-center justify-between gap-012-3">
              <p className="text-Text">تولید محتوا در شبکه های اجتماعی</p>
              <P.Button Theme="primary">شروع</P.Button>
              </P.CardContent>
            </P.Card>
          </P.CardContent>
        </P.Card>
      </P.Container>



      {/* <P.Container>

        <P.Card>
          <P.CardHeader>
            <P.CardTitle>Card Title</P.CardTitle>
            <P.CardDescription>Card Description</P.CardDescription>
          </P.CardHeader>
          <P.CardContent>
            Card Content
          </P.CardContent>
          <P.CardFooter>
            Card Footer
          </P.CardFooter>
        </P.Card>

        <P.Card className="relative overflow-hidden border-2 border-Primary/30 bg-linear-to-br from-PrimaryLight/10 via-PrimaryLight/5 to-Background shadow-lg">
            <div className="absolute top-0 end-0 w-32 h-32 bg-Primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
            <P.CardHeader className="relative p-6 lg:p-8 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-Primary/20 flex items-center justify-center shrink-0">
                  <Icon Icon="dashboard" Stroke="md" className="text-Primary" Size="md" />
                </div>
                <P.CardTitle className="text-xl lg:text-2xl font-bold text-Primary">اولین قدم</P.CardTitle>
              </div>
              <P.CardDescription className="text-sm text-Mid">
                برای استفاده کامل از امکانات، لطفاً پروفایل خود را تکمیل کنید
              </P.CardDescription>
            </P.CardHeader>
            <P.CardContent className="relative p-6 lg:p-8 pt-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-PrimaryLight/10 border border-PrimaryLight/30">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-base font-semibold text-Text">تکمیل پروفایل</span>
                    <span className="text-xs font-medium text-Mid bg-Mid/10 px-2 py-1 rounded-full">
                      20% تکمیل شده
                    </span>
                  </div>
                  <p className="text-sm text-Mid">
                    با تکمیل اطلاعات پروفایل، دسترسی به تمام امکانات را دریافت خواهید کرد
                  </p>
                </div>
                <P.Button
                  Theme="primary"
                  className="shrink-0 w-full sm:w-auto"
                >
                  شروع تکمیل پروفایل
                </P.Button>
              </div>
            </P.CardContent>
          </P.Card>


      </P.Container> */}

      <div className="h-400-I bg-Secondary max-w-7xl mx-auto flex justify-center items-center" >
        COMMMENTS
      </div>
    </main>
  )
}