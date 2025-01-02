import { Event, MatchInfo } from "@/lib/types/eventType"
import { Heading } from "../ui/heading"
import { Input } from "../ui/input"
import { Paragraph } from "../ui/paragraph"
import { Button } from "../ui/button"
import fetchTBA from "@/lib/fetchTBA"
import { addNotification } from "../ui/notifications"
import { useState } from "react"
import { Search, View } from "lucide-react"
import { useAppContext } from "@/lib/context/appContext"
import { db } from "@/lib/db"
import { Divider } from "../ui/divider"
import { StyledLink } from "../StyledLink"

const pullSchedules = async (key: string): Promise<MatchInfo[] | null> => {
    const data: any[] | null = await fetchTBA({
        url: `https://www.thebluealliance.com/api/v3/event/${key}/matches/simple`,
    }).catch(() => addNotification("error", "SAMUEL"))

    if (!data) return null
    addNotification("success", "Search complete")

    const formatted: MatchInfo[] = data.reduce((result, match) => {
        if (match.comp_level !== "qm") return result
        return [
            ...result,
            {
                match_number: match.match_number,
                red: match.alliances.red.team_keys.map((team: string) =>
                    team.replace("frc", "")
                ),
                blue: match.alliances.blue.team_keys.map((team: string) =>
                    team.replace("frc", "")
                ),
            },
        ]
    }, [])
    return formatted.sort((a, b) => {
        if (a.match_number < b.match_number) return -1
        if (a.match_number > b.match_number) return 1
        return 0
    })
}

export const DashboardSettings = ({
    eventData,
}: {
    eventData: Event | null
}) => {
    if (!eventData) return

    const [schedule, setSchedule] = useState<MatchInfo[]>(eventData.schedule)

    const { connectionState } = useAppContext()

    const getScheduleFromAPI = async () => {
        const key = `${eventData?.year}${eventData?.event_code}`
        const schedule = await pullSchedules(key)
        if (schedule) {
            db.events.update(eventData, { ...eventData, schedule: schedule })
            setSchedule(schedule)
        }
    }

    return (
        <>
            <div className="rounded bg-neutral-100 p-4 dark:bg-[#302E2E]">
                <div className="flex flex-col gap-2">
                    <Heading>User Settings</Heading>
                    <div>
                        <Paragraph size="sm">Tablet Number</Paragraph>
                        <Input className="bg-neutral-300"></Input>
                    </div>
                </div>
                <Divider className="my-4" />
                <div className="flex flex-col gap-2">
                    <Heading>Event Settings</Heading>
                    <div>
                        <Paragraph size="sm">Schedule</Paragraph>
                        <div
                            className={`flex items-center justify-between rounded ${schedule?.length <= 0 ? "border-2" : ""} border-red-400 bg-neutral-300 px-3 py-2 dark:bg-neutral-800`}
                        >
                            {schedule?.length} Matches
                            <div className="flex gap-4">
                                <Button
                                    onClick={() => getScheduleFromAPI()}
                                    disabled={!connectionState}
                                >
                                    <Search className="w-5" />
                                </Button>
                                <StyledLink to={"./schedule"}>
                                    <View className="w-5" />
                                </StyledLink>
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <Paragraph size="sm">Name</Paragraph>
                        <Input
                            className="bg-neutral-300"
                            placeholder={eventData.name}
                        />
                    </div>
                    <div className="">
                        <Paragraph size="sm">Code</Paragraph>
                        <Input
                            className="bg-neutral-300"
                            placeholder={eventData.event_code}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
