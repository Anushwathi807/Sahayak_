import PageHeader from '../../components/ui/PageHeader'
import RecentList from './RecentList'
import TextbookScanner from './TextbookScanner'

export default function LibraryPage() {
  return (
    <>
      <PageHeader
        title="Library"
        description="Scan textbook pages so answers follow your book, and reopen what you have made."
      />
      <div className="flex flex-col gap-8">
        <TextbookScanner />
        <RecentList />
      </div>
    </>
  )
}
