import { ModulePage } from "@/admin/components/module-page";import { fallbackModule,modules } from "@/admin/services/modules";
export default async function Page({params}:{params:Promise<{slug:string[]}>}){const{slug}=await params;const path=slug.join("/");return <ModulePage module={modules[path]??fallbackModule(path)}/>}
