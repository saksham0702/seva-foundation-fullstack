import axiosInstance from ".";

export const uploadFile = async (payload: {file:File,data:object}) => {
    const {file,data} = payload;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("data",JSON.stringify(data));
    const response = await axiosInstance.post("/upload", formData,{
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
}

