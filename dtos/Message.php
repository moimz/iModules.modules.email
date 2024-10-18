<?php
/**
 * 이 파일은 아이모듈 이메일모듈 일부입니다. (https://www.imodules.io)
 *
 * 메시지 구조체를 정의한다.
 *
 * @file /modules/email/dtos/Message.php
 * @author pbj <ju318@ubion.co.kr>
 * @license MIT License
 * @modified 2024. 10. 18.
 */
namespace modules\email\dtos;
class Message
{
    /**
     * @var string $_id 메시지고유값
     */
    private string $_id;

    /**
     * @var int $_member_id 수신자회원고유값
     */
    private int $_member_id;

    /**
     * @var string $_email 수신자메일주소
     */
    private string $_email;

    /**
     * @var string $_name 수신자명
     */
    private string $_name;

    /**
     * @var string $_component_type 컴포넌트종류
     */
    private string $_component_type;

    /**
     * @var string $_component_name 컴포넌트명
     */
    private string $_component_name;

    /**
     * @var string $_title 타이틀
     */
    private string $_title;

    /**
     * @var string $_content 본문내용
     */
    private string $_content;

    /**
     * @var string $_template 본문템플릿
     */
    private string $_template;

    /**
     * @var string $_sended_by 발송자회원고유값
     */
    private string $_sended_by;

    /**
     * @var string $_sended_email 발송자메일주소
     */
    private string $_sended_email;

    /**
     * @var string $_sended_name 발송자명
     */
    private string $_sended_name;

    /**
     * @var string $_sended_at 발송일시
     */
    private string $_sended_at;

    /**
     * @var ?string $_checked_at 확인일시
     */
    private ?string $_checked_at;

    /**
     * @var string $_status 발송상태
     */
    private string $_status;

    /**
     * @var ?string $_response 발송응답내용
     */
    private ?string $_response;

    /**
     * 메시지 구조체를 정의한다.
     *
     * @param object $message 메시지정보
     */
    public function __construct(object $message)
    {
        $this->_id = $message->message_id;
        $this->_member_id = $message->member_id;
        $this->_email = $message->email;
        $this->_name = $message->name;
        $this->_component_type = $message->component_type;
        $this->_component_name = $message->component_name;
        $this->_title = $message->title;
        $this->_content = $message->content;
        $this->_template = $message->template;
        $this->_sended_by = $message->sended_by;
        $this->_sended_email = $message->sended_email;
        $this->_sended_name = $message->sended_name;
        $this->_sended_at = $message->sended_at;
        $this->_checked_at = $message->checked_at;

        $this->_status = $message->status;
        $this->_response = $message->response;
    }

    /**
     * 고유값을 가져온다.
     *
     * @return string $id
     */
    public function getId(): string
    {
        return $this->_id;
    }

    /**
     * 확인일시를 가져온다.
     *
     * @return ?string $checked_at
     */
    public function getCheckedAt(): ?string
    {
        return $this->_checked_at;
    }

    /**
     * 발송자를 가져온다.
     *
     * @return \modules\email\dtos\Address $address
     */
    public function getSendedBy(): \modules\email\dtos\Address
    {
        /**
         * @var \modules\email\Email $mEmail
         */
        $mEmail = \Modules::get('email');
        return $mEmail->getAddress($this->_sended_email, $this->_sended_name, $this->_sended_by);
    }

    /**
     * 수신자를  가져온다.
     *
     * @return \modules\email\dtos\Address $address
     */
    public function getMemberBy(): \modules\email\dtos\Address
    {
        /**
         * @var \modules\email\Email $mEmail
         */
        $mEmail = \Modules::get('email');
        return $mEmail->getAddress($this->_email, $this->_name, $this->_member_id);
    }

    /**
     * 템플릿이 적용된 컨텐츠를 가져온다.
     *
     * @param bool $is_template 템플릿포함여부
     * @return string $content
     */
    public function getContent(bool $is_template = false): string
    {
        /**
         * @var \modules\email\Email $mEmail
         */
        $mEmail = \Modules::get('email');
        $sender = $mEmail->getSender(\Modules::get($this->_component_name));
        return $sender->getContent(true, $this->_content);
    }

    public function getJson(): object
    {
        $message = new \stdClass();
        $message->message_id = $this->_id;
        $message->member_id = $this->_member_id;
        $message->member_by = $this->getMemberBy()->getJson();
        $message->email = $this->_email;
        $message->name = $this->_name;
        $message->component_type = $this->_component_type;
        $message->component_name = $this->_component_name;
        $message->title = $this->_title;
        $message->content = $this->_content;
        $message->template = $this->_template;
        $message->sended_by = $this->getSendedBy()->getJson();
        $message->sended_email = $this->_sended_email;
        $message->sended_name = $this->_sended_name;
        $message->sended_at = $this->_sended_at;
        $message->checked_at = $this->_checked_at;
        $message->status = $this->_status;
        $message->response = $this->_response;

        return $message;
    }
}
