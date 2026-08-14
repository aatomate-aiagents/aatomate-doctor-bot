import re

with open("frontend/src/app/doctor/settings/page.tsx", "r") as f:
    content = f.read()

# 1. Add import
if "AvailabilityTab" not in content:
    content = content.replace(
        "import { useSearchParams, useRouter } from \"next/navigation\";",
        "import { useSearchParams, useRouter } from \"next/navigation\";\nimport { AvailabilityTab } from \"./AvailabilityTab\";"
    )

# 2. Add TabsTrigger
trigger_html = """          <TabsTrigger value="availability" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-md">
            <Clock className="w-4 h-4 mr-2" />
            Schedule & Availability
          </TabsTrigger>"""

if "value=\"availability\"" not in content:
    content = content.replace(
        "            Account & Security\n          </TabsTrigger>",
        "            Account & Security\n          </TabsTrigger>\n" + trigger_html
    )

# 3. Add TabsContent
content_html = """        <TabsContent value="availability">
          <AvailabilityTab userProfile={userProfile} />
        </TabsContent>"""

if "<AvailabilityTab" not in content:
    content = content.replace(
        "        <TabsContent value=\"preferences\">",
        content_html + "\n\n        <TabsContent value=\"preferences\">"
    )

with open("frontend/src/app/doctor/settings/page.tsx", "w") as f:
    f.write(content)

print("Patched doctor settings")
