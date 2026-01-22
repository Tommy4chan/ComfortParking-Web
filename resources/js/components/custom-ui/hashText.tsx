import { Hash } from "lucide-react"
import { CopyButton } from "../ui/copyButton"

const HashText = ({ hash }: { hash: string }) => {
  return (
    <p className="text-sm font-mono flex items-center gap-2">
      <Hash className="h-4 w-4" />
      {hash}
      <CopyButton
        content={hash}
        size={'sm'}
        variant={'ghost'}
      />
    </p>
  )
}
export default HashText