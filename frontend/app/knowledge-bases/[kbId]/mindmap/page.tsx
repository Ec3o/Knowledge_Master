import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import MindMapEcharts from "@/components/mindmap/MindMapEcharts";


export default async function MindMapPage({
                                        params,
                                    }: {
    params: { kbId: string }
}) {

    const { kbId} = await params;
    return (
        <div className="container mx-auto flex flex-col h-screen py-4">
            <div className="flex items-center mb-6">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/knowledge-bases/${kbId}`}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        返回知识库
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold ml-4">知识库思维导图</h1>
            </div>
            <div className="flex-1 overflow-hidden">
                <MindMapEcharts kbId={kbId} />
            </div>
        </div>
    )
}
