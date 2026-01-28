Recruitment setup: checklist → pipelines → scorecards → templates
Staff setup: departments → job roles → onboarding templates → onboarding
Leave setup: leave policies → holidays → calendar
Payroll first run: pay schedules → pay groups → run payroll
Attendance scheduling: shift management → rotas

src/features/employees/
domain/
types.ts
formatters.ts

entities/
profile/
schema.ts
fields.ts
adapter.ts
api.ts
employment/
schema.ts
fields.ts
adapter.ts
api.ts
finance/
schema.ts
fields.ts
adapter.ts
api.ts
compensation/
schema.ts
fields.ts
adapter.ts
api.ts
dependent/
schema.ts
fields.ts
adapter.ts
api.ts
history/
schema.ts
fields.ts
adapter.ts
api.ts

registry.ts

ui/
DetailsCard.tsx // dumb card
KeyValueRows.tsx // dumb list
EntityTableCard.tsx // for dependents/history

sheets/
EntitySheetHost.tsx // only place with RHF + zod + mutation
EntitySheetTrigger.tsx // icon button Add/Edit (optional)

sections/
ProfileSection.tsx
EmploymentSection.tsx
CompensationSection.tsx
FinanceSection.tsx
FamilySection.tsx
HistorySection.tsx
