"use client";

import useSWR from "swr";
import AnimatedList from "@/common/components/elements/AnimatedList";
import { ProjectItem } from "@/common/types/projects";
import { fetcher } from "@/services/fetcher";

const AnimatedListProject = () => {
  const { data } = useSWR("/api/projects", fetcher);

  const projects = data
    ?.filter((item: ProjectItem) => item?.is_show)
    .sort((a: ProjectItem, b: ProjectItem) => b.id - a.id)
    .map((item: ProjectItem) => {
      const imageUrl = item.image || ""; 
      const formattedImage = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;

      return {
        ...item,
        image: formattedImage,
        href: `/projects/${item.slug}`,
      };
    }) ?? [];

  return (
    <AnimatedList
      // 2. Gunakan hasil 'projects' yang sudah di-map di atas
      // Tidak perlu melakukan .map() lagi dengan logika startsWith di sini
      items={projects}
      itemImage={true}
      showGradients={false}
      displayScrollbar={false}
    />
  );
};

export default AnimatedListProject;