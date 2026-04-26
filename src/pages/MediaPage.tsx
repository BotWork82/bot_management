import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Grid3x3, List, Download, Video, Search } from "lucide-react";
import { Loader } from "../components/ui/loader";
import { useMediaQuery, useDownloadMedia } from "../hooks/media";
import type { MediaItem } from "../services/media.service";
import { Pagination } from "../components/ui/pagination";
import { api } from "../services/api";
import MediaPreview from "../components/MediaPreview";

const filters = [
	{ id: "all", label: "All" },
	{ id: "images", label: "Images" },
	{ id: "videos", label: "Videos" }
];

export function MediaPage() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(12);
	const { data: mediaData, isLoading } = useMediaQuery(page, pageSize);
	const downloadMutation = useDownloadMedia();

	const items = (mediaData && ((mediaData as any).items ?? (mediaData as any).content ?? (mediaData as any).media)) || [];
	const total = (mediaData && (mediaData as any).total) || items.length;

	if (page > 1 && total > 0) {
		const last = Math.ceil(total / pageSize);
		if (page > last) setPage(last);
	}

	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [activeFilter, setActiveFilter] = useState<"all" | "images" | "videos">("all");

	const filtered = (items || []).filter((item: MediaItem) => {
		if (activeFilter === "images") return item.type === "image";
		if (activeFilter === "videos") return item.type === "video";
		return true;
	});
	const hasMedia = filtered.length > 0;

	const handleDownload = async (item: MediaItem) => {
		try {
			const res = await downloadMutation.mutateAsync(item);
			const href = res.url;
			const filename = res.filename || item.name || "media";
			const a = document.createElement("a");
			a.href = href;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			a.remove();
			// if we created an object URL, revoke it shortly after
			if (res.isObjectUrl) {
				setTimeout(() => {
					try { URL.revokeObjectURL(href); } catch {};
				}, 5000);
			}
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					{filters.map((f) => (
						<button
							key={f.id}
							onClick={() => setActiveFilter(f.id as any)}
							className={`h-9 rounded-full px-4 text-xs font-medium border transition-colors ${
								f.id === activeFilter
									? "bg-blue-600 text-white border-blue-600"
									: "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
							}`}
						>
							{f.label}
						</button>
					))}
				</div>

				<div className="flex items-center gap-3">
					<div className="relative w-full max-w-md sm:w-64">
						<Input
							placeholder="Search..."
							className="h-10 rounded-full pl-10 bg-muted/60 border-none w-full"
						/>
						<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
							<Search className="w-4 h-4 text-muted-foreground" />
						</span>
					</div>
					<div className="flex items-center gap-1">
						<button
							onClick={() => setViewMode("grid")}
							className={`h-8 w-8 flex items-center justify-center rounded-full transition-colors ${
								viewMode === "grid"
									? "bg-blue-600 text-white"
									: "bg-slate-100 text-slate-500 hover:bg-slate-200"
							}`}
							title="Grid view"
						>
							<Grid3x3 className="h-4 w-4" />
						</button>
						<button
							onClick={() => setViewMode("list")}
							className={`h-8 w-8 flex items-center justify-center rounded-full transition-colors ${
								viewMode === "list"
									? "bg-blue-600 text-white"
									: "bg-slate-100 text-slate-500 hover:bg-slate-200"
							}`}
							title="List view"
						>
							<List className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>

			{isLoading ? (
				<div className="py-12 flex items-center justify-center">
					<Loader size="md" />
				</div>
			) : !hasMedia ? (
				<Card className="rounded-2xl border border-border/70 shadow-sm">
					<CardContent className="py-12 text-center text-sm text-muted-foreground">
						Aucun element disponible dans cette liste.
					</CardContent>
				</Card>
			) : (
				<>
					{/* Mobile only: grid or list */}
					<div className="md:hidden space-y-3">
						{viewMode === "grid" ? (
							<div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
								{filtered.map((item: MediaItem) => {
									return (
										<Card key={item._id} className="overflow-hidden rounded-2xl border-border shadow-sm">
											<div className="relative h-48 w-full overflow-hidden bg-slate-100">
												<MediaPreview srcRef={item._id ?? item.id ?? item.src ?? item.url} type={item.type} className="h-full w-full object-cover" />
												{item.type === "video" && (
													<span className="absolute right-3 top-3 rounded-full bg-black/70 text-white text-[11px] px-2 py-1 flex items-center gap-1">
														<Video className="h-3 w-3" />
														<span>Video</span>
													</span>
												)}
												<button
													onClick={() => handleDownload(item)}
													className="absolute right-3 bottom-3 h-8 w-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-colors"
													title="Download"
												>
													<Download className="h-4 w-4 text-slate-700" />
												</button>
											</div>
											<CardContent className="p-4 space-y-1">
												<div className="text-sm font-medium text-slate-800 truncate">{item.label}</div>
												<div className="text-xs text-muted-foreground">{item.farm}</div>
											</CardContent>
										</Card>
									);
									})}
							</div>
						) : (
							<div className="space-y-3">
								{filtered.map((item: MediaItem) => {
									return (
										<Card key={item._id} className="overflow-hidden rounded-xl border border-border/70 shadow-sm">
											<div className="flex items-center gap-4 p-4">
												<div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
													<MediaPreview srcRef={item._id ?? item.id ?? item.src ?? item.url} type={item.type} className="h-full w-full object-cover max-w-full" />
												</div>
												<div className="flex-1 min-w-0">
												<div className="text-sm font-medium text-slate-800 truncate">{item.label}</div>
												<div className="text-xs text-muted-foreground mt-1">{item.farm}</div>
												</div>
												<button
													onClick={() => handleDownload(item)}
													className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors flex-shrink-0"
													title="Download"
												>
													<Download className="h-4 w-4 text-slate-700" />
												</button>
											</div>
										</Card>
									);
									})}
							</div>
						)}
					</div>

					{/* Desktop: respect viewMode too */}
					<div className="hidden md:block">
						{viewMode === "grid" ? (
							<div className="grid gap-6 grid-cols-3">
								{filtered.map((item: MediaItem) => {
									return (
										<Card key={item._id} className="overflow-hidden rounded-2xl border-border shadow-sm">
											<div className="relative h-56 w-full overflow-hidden bg-slate-100">
												<MediaPreview srcRef={item._id ?? item.id ?? item.src ?? item.url} type={item.type} className="h-full w-full object-cover" />
												{item.type === "video" && (
													<span className="absolute right-3 top-3 rounded-full bg-black/70 text-white text-[11px] px-2 py-1"><Video className="h-3 w-3" /> <span>Video</span></span>
												)}
												<button
													onClick={() => handleDownload(item)}
													className="absolute right-3 bottom-3 h-9 px-3 rounded-full bg-white/95 hover:bg-white flex items-center gap-2 justify-center shadow-md transition-colors"
													title="Download"
												>
													<Download className="h-4 w-4 text-slate-700" />
													<span className="text-xs hidden sm:inline text-slate-700">Download</span>
												</button>
											</div>
											<CardContent className="p-4 space-y-1">
												<div className="text-sm font-medium text-slate-800 truncate">{item.label}</div>
												<div className="text-xs text-muted-foreground">{item.farm}</div>
											</CardContent>
										</Card>
									);
									})}
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="table-fixed w-full text-sm">
									<thead className="text-xs text-muted-foreground border-b">
										<tr className="h-10">
											<th className="text-left font-medium">Preview</th>
											<th className="text-left font-medium">Label</th>
											<th className="text-left font-medium">Farm</th>
											<th className="text-left font-medium w-24">Type</th>
											<th className="text-right font-medium w-24">Actions</th>
										</tr>
									</thead>
									<tbody>
										{filtered.map((item: MediaItem) => {
											return (
												<tr key={item._id} className="border-b last:border-0 hover:bg-muted/40">
													<td className="py-3 align-top">
														<div className="h-16 w-24 overflow-hidden rounded-md bg-slate-100">
															<MediaPreview srcRef={item._id ?? item.id ?? item.src ?? item.url} type={item.type} className="h-full w-full object-cover max-w-full" />
														</div>
													</td>
													<td className="py-3 align-top">
														<div className="min-w-0 text-sm font-medium text-slate-800 truncate">
															{item.label}
														</div>
													</td>
													<td className="py-3 align-top">
														<div className="min-w-0 text-xs text-muted-foreground truncate">
															{item.farm}
														</div>
													</td>
													<td className="py-3 align-top text-xs text-muted-foreground">
														{item.type}
													</td>
													<td className="py-3 align-top text-right">
														<button onClick={() => handleDownload(item)} className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 shadow-sm hover:bg-white" title="Download">
															<Download className="h-4 w-4 text-slate-700" />
															<span className="text-xs text-slate-700">Download</span>
														</button>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</div>

					<Pagination page={page} pageSize={pageSize} total={total} onPageChange={(p: number) => setPage(p)} onPageSizeChange={(s: number) => { setPageSize(s); setPage(1); }} />
				</>
			)}

		</div>
	);
}
