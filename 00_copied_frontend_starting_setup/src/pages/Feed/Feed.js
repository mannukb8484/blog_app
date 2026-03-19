import React, { Component, Fragment } from "react";
// s19
import openSocket from "socket.io-client";

import Post from "../../components/Feed/Post/Post";
import Button from "../../components/Button/Button";
import FeedEdit from "../../components/Feed/FeedEdit/FeedEdit";
import Input from "../../components/Form/Input/Input";
import Paginator from "../../components/Paginator/Paginator";
import Loader from "../../components/Loader/Loader";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import "./Feed.css";

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: "",
    postPage: 1,
    postsLoading: true,
    editLoading: false,
  };

  componentDidMount() {
    fetch("URL")
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Failed to fetch user status.");
        }
        return res.json();
      })
      .then((resData) => {
        this.setState({ status: resData.status });
      })
      .catch(this.catchError);

    this.loadPosts();
    // s19: see the backend data sent aq that accesss it
    // during c_back of socket.on, and use same channel
    // name as backend here on socket.on
    const socket = openSocket("http://localhost:8080");
    socket.on("posts", (data) => {
      if (data.action === "create") {
        this.addPost(data.post);
      } else if (data.action === "update") {
        this.updatePost(data.post);
      } else if (data.action === "delete") {
        //just old function not created new unlike create && edit
        this.loadPosts();
      }
    });
  }
  // s19: extra function for socket
  addPost = (post) => {
    this.setState((prevState) => {
      const updatedPosts = [...prevState.posts];
      if (prevState.postPage === 1) {
        if (updatedPosts.length >= 2) {
          updatedPosts.pop();
        }
        // updatedPosts.pop();
        updatedPosts.unshift(post);
      }
      return {
        posts: updatedPosts,
        totalPosts: prevState.totalPosts + 1,
      };
    });
  };
  // s20: edit function for socket
  updatePost = (post) => {
    this.setState((prevState) => {
      const updatedPosts = [...prevState.posts];
      const updatePostIndex = updatedPosts.findIndex((p) => p._id === post._id);
      if (updatePostIndex > -1) {
        updatedPosts[updatePostIndex] = post;
      }
      return {
        posts: updatedPosts,
      };
    });
  };

  loadPosts = (direction) => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === "next") {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === "previous") {
      page--;
      this.setState({ postPage: page });
    }
    // change 1: url of frontend single_post data
    // fetch("http://localhost:8080/feed/posts")
    // s10: above url correct: but for pagination now edit, give page to backend
    fetch("http://localhost:8080/feed/posts?page=" + page, {
      // s16
      headers: {
        //space after Bearer must to split token on frontend
        Authorization: "Bearer " + this.props.token,
      },
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Failed to fetch posts.");
        }
        return res.json();
      })
      .then((resData) => {
        this.setState({
          // s8: tweak data aq what react_component/any_service expect
          //imageUrl coming from backend,
          // react component expect imagePath,
          // see in component->feededit.js
          // in ram, a copy for this particular microservice
          // not changing original
          posts: resData.posts.map((post) => {
            return {
              ...post,
              imagePath: post.imageUrl,
            };
          }),
          totalPosts: resData.totalItems,
          postsLoading: false,
        });
      })
      .catch(this.catchError);
  };

  statusUpdateHandler = (event) => {
    event.preventDefault();
    fetch("URL")
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Can't update status!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = (postId) => {
    this.setState((prevState) => {
      const loadedPost = { ...prevState.posts.find((p) => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost,
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  // for both editing and creating new post...see comment how
  // state.editPost and  prevState.editPost, does this smartly in same form...
  finishEditHandler = (postData) => {
    this.setState({
      editLoading: true,
    });
    // s7:
    const formData = new FormData();
    formData.append("title", postData.title);
    formData.append("content", postData.content);
    formData.append("image", postData.image);
    // Set up data (with image!)
    let url = "http://localhost:8080/feed/post";
    let method = "POST";
    if (this.state.editPost) {
      //set url to edit end_point, if editing
      url = "http://localhost:8080/feed/post/" + this.state.editPost._id;
      method = "PUT";
    }

    fetch(url, {
      method: method,
      body: formData,
      //s16
      headers: {
        //space after Bearer must to split token on frontend
        Authorization: "Bearer " + this.props.token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Creating or editing a post failed!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData); //
        const post = {
          _id: resData.post._id,
          title: resData.post.title,
          content: resData.post.content,
          creator: resData.post.creator,
          createdAt: resData.post.createdAt,
        };
        this.setState((prevState) => {
          // s20:updated posts emmited via socket

          // let updatedPosts = [...prevState.posts];
          // if (prevState.editPost) {
          //   //Again checking:Are we editing?
          //   const postIndex = prevState.posts.findIndex(
          //     (p) => p._id === prevState.editPost._id,
          //   );
          //   updatedPosts[postIndex] = post;
          // }

          // S19:
          // emit sends to itself as well,and original
          // react code also render new post hence on the host side
          // same post renderd twice,hence stop original rendering for newly created post
          // else if (prevState.posts.length < 2) {
          //   updatedPosts = prevState.posts.concat(post);
          // }
          return {
            // posts: updatedPosts, //s20
            isEditing: false,
            editPost: null,
            editLoading: false,
          };
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err,
        });
      });
  };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  deletePostHandler = (postId) => {
    this.setState({ postsLoading: true });
    // s9:
    fetch("http://localhost:8080/feed/post/" + postId, {
      method: "delete",
      // s16
      headers: {
        //space after Bearer must to split token on frontend
        Authorization: "Bearer " + this.props.token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Deleting a post failed!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        // s21: delete socket-io
        // this.setState((prevState) => {
        //   const updatedPosts = prevState.posts.filter((p) => p._id !== postId);
        //   return { posts: updatedPosts, postsLoading: false };
        // });

        //s21: comment all above logic an dsimply call loadpost()
        //SOCKET DOES IT FOR HOST AS WELL USING EMIT SO NO NEED HERE,
        //STILL SO MESSAGE DISSAPEAR FROM HOST MACHINE AT SPEED
        this.loadPosts();
      })
      .catch((err) => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = (error) => {
    this.setState({ error: error });
  };
  // see what fields frontend seeks, for rendering of the post
  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: "center" }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, "previous")}
              onNext={this.loadPosts.bind(this, "next")}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map((post) => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator.name}
                  date={new Date(post.createdAt).toLocaleDateString("en-US")}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
