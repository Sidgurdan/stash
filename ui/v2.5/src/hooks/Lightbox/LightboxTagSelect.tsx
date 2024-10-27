import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useToast } from "src/hooks/Toast";
import { useImageUpdate } from "src/core/StashService";
import { ILightboxImage } from "src/hooks/Lightbox/types";
import { Tag } from "../../components/Tags/TagSelect";
import { useLightboxTagsEdit } from "src/hooks/useLightboxTagsEdit";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "../../components/Shared/Icon";
import "./LightboxTagSelect.scss";

interface ILightboxTagSelectProps {
  currentImage: ILightboxImage;
}

export const LightboxTagSelect: React.FC<ILightboxTagSelectProps> = ({
  currentImage,
}) => {
  const [updateImage] = useImageUpdate();
  const [tags, setTags] = useState<Tag[]>(currentImage.tags || []);
  const [tagIds, setTagIds] = useState<string[]|null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const Toast = useToast();

  const { tagsControl, onSetTags } = useLightboxTagsEdit(tags, (ids) => {
    console.log('[LTS] update tagIds', ids);

    // Check if the tags have changed compared to the original tags
    if(tagIds !== null){
      const currentTagIds = tags.map((tag) => tag.id).sort().join(',');
      const newTagIds = ids.sort().join(',');
      if(currentTagIds !== newTagIds){
        setIsDirty(true);
      } else {
        setIsDirty(false);
      }
    }

    setTagIds([...ids]);
  });

  useEffect(() => {
    if (currentImage.tags) {
      console.log('[LTS]call onSetTags ', currentImage.tags);
      onSetTags(currentImage.tags);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImage]);

  const handleSaveTags = async () => {
    if(!currentImage.id || !isDirty) {
      return;
    }
    await updateImage({
      variables: {
        input: {
          id: currentImage.id,
          tag_ids: tagIds,
        }
      },
    });
    Toast.success("Tags updated successfully");
  };

  return (
    <div className="lightbox-tags">
      <div className="lightbox-tags__wrapper">
        {tagsControl()}
        {isDirty ? (
          <Button className="minimal ml-2 lightbox-tags__save-button" onClick={handleSaveTags}>
            <Icon className="fa-fw" icon={faSave} />
          </Button>
        ) : null}
      </div>
    </div>
  );
};
