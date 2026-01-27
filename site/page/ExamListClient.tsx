'use client'

/* --- Base ------------------------------------------------------------------------------------- */
import { useRouter } from 'next/navigation'
import { UI as P } from '@/core/components/ui/Pelak'
import { Icon } from '@/core/components/ui/Icon'
import { ExamData } from '@/core/api/integration/exams/[eurl]/route'
import { LANGUAGE_TYPE } from '@/core/config/lang'

interface ExamListClientProps {
  lang: LANGUAGE_TYPE
}

// Mock exam data
const mockExams: ExamData[] = [
  {
    eurl: 1,
    title: 'آزمون سنجش دانش عمومی',
    type: 1,
    accept_score: 50,
    number_of_question: 30,
    duration: 45,
    can_back: true,
    is_active: true,
  },
  {
    eurl: 2,
    title: 'آزمون تخصصی مدیریت',
    type: 2,
    accept_score: 60,
    number_of_question: 40,
    duration: 60,
    can_back: false,
    is_active: true,
  },
  {
    eurl: 3,
    title: 'آزمون مهارت‌های ارتباطی',
    type: 1,
    accept_score: 55,
    number_of_question: 25,
    duration: 30,
    can_back: true,
    is_active: false,
  },
  {
    eurl: 4,
    title: 'آزمون تحلیل و تصمیم‌گیری',
    type: 2,
    accept_score: 65,
    number_of_question: 35,
    duration: 50,
    can_back: true,
    is_active: true,
  },
]

export default function ExamListClient({ lang }: ExamListClientProps) {
  const router = useRouter()

  const handleExamClick = (examid: number, eurl: number) => {
    router.push(`/${lang}/dashboard/exam/${examid}?eurl=${eurl}`)
  }

  return (
    <main className="bg-Background lg:pt-034-7 min-h-[calc(100svh-var(--spacing-144-D))]">
      <P.Container className="space-y-018-4 lg:space-y-024-6">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-Text mb-2">لیست آزمون‌ها</h1>
            <div className="h-1 w-20 bg-Mid/30 rounded-full"></div>
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {mockExams.map((exam) => (
            <P.Card
              key={exam.eurl}
              className="relative overflow-hidden border-2 border-Primary/30 bg-linear-to-br from-PrimaryLight/10 via-PrimaryLight/5 to-Background shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => handleExamClick(exam.eurl, exam.eurl)}
            >
              <div className="absolute top-0 end-0 w-32 h-32 bg-Primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
              <P.CardHeader className="relative p-6 lg:p-8 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-Primary/20 flex items-center justify-center shrink-0">
                    <Icon Icon="dashboard" Stroke="md" className="text-Primary" Size="md" />
                  </div>
                  <P.CardTitle className="text-lg lg:text-xl font-bold text-Primary line-clamp-2">
                    {exam.title}
                  </P.CardTitle>
                </div>
                <P.CardDescription className="text-sm text-Mid">
                  {exam.number_of_question} سوال • {exam.duration} دقیقه
                </P.CardDescription>
              </P.CardHeader>
              <P.CardContent className="relative pt-0">
                <div className="space-y-4">
                  {/* Exam Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-Mid">حداقل نمره قبولی:</span>
                      <span className="text-Text font-semibold">{exam.accept_score}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-Mid">بازگشت به سوالات:</span>
                      <span className="text-Text font-semibold">
                        {exam.can_back ? 'بله' : 'خیر'}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-PrimaryLight/10 border border-PrimaryLight/30">
                    <span className="text-xs text-Mid">وضعیت</span>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      exam.is_active
                        ? 'bg-Success/10 text-Success border border-Success/20'
                        : 'bg-Error/10 text-Error border border-Error/20'
                    }`}>
                      {exam.is_active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </div>

                  {/* View Button */}
                  <P.Button
                    Theme="primary"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExamClick(exam.eurl, exam.eurl)
                    }}
                    disabled={!exam.is_active}
                  >
                    {exam.is_active ? 'مشاهده آزمون' : 'غیرفعال'}
                  </P.Button>
                </div>
              </P.CardContent>
            </P.Card>
          ))}
        </div>

        {/* Empty State (if no exams) */}
        {mockExams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-Mid text-lg">هیچ آزمونی یافت نشد</p>
          </div>
        )}
      </P.Container>
    </main>
  )
}
